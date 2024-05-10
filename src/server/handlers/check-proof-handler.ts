import {HttpResponseResolver} from "msw";
import {CheckProofRequest} from "../dto/check-proof-request-dto";
import {createAuthToken, verifyToken} from "../utils/jwt";
import {TonProofService} from "../services/ton-proof-service";
import {badRequest, ok} from "../utils/http-utils";

/**
 * Type definition for the check proof handler.
 */
type CheckProofHandler = (service: TonProofService) => HttpResponseResolver;

/**
 * Checks the proof and returns an access token.
 *
 * POST /api/check_proof
 */
export const checkProofHandler: CheckProofHandler = (service) => async ({request}) => {
  try {
    const body = CheckProofRequest.parse(await request.json())

    const isValid = await service.checkProof(body);
    if (!isValid) {
      return badRequest({error: 'Invalid proof'});
    }

    const payloadToken = body.proof.payload;
    if (!await verifyToken(payloadToken)) {
      return badRequest({error: 'Invalid token'});
    }

    const token = await createAuthToken({address: body.address});

    return ok({token: token});
  } catch (e) {
    return badRequest({error: 'Invalid request', trace: e});
  }
};