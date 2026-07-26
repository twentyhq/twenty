import * as jwt from 'jsonwebtoken';
import { isDefined } from 'twenty-shared/utils';

/**
 * Decodes a JWT payload WITHOUT verifying the signature.
 * This must ONLY be used for key-selection purposes before a subsequent jwt.verify() call.
 * Never use this function alone for authentication or authorization decisions.
 */
export const unsafeDecodeJwtPayload = <T>(
  rawJwtToken: string,
): T | undefined => {
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
