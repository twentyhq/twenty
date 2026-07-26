import * as jwt from 'jsonwebtoken';
import { isDefined } from 'twenty-shared/utils';

/**
 * @internal
 * WARNING: This function does NOT verify the JWT signature. It only
 * base64-decodes the payload. Do NOT use the returned claims for
 * authorization decisions. Always call jwt.verify() / verifyJwtToken()
 * afterwards to cryptographically validate the token.
 */
export const decodeJwtPayload = <T>(rawJwtToken: string): T | undefined => {
  try {
    const decoded = jwt.decode(rawJwtToken, { json: true });

    if (!isDefined(decoded)) {
      return undefined;
    }

    return decoded as T;
  } catch {
    return undefined;
  }
};
