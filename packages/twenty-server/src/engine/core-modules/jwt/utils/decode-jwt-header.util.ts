import * as jwt from 'jsonwebtoken';
import { isDefined } from 'twenty-shared/utils';

export const decodeJwtHeader = (
  rawJwtToken: string,
): jwt.JwtHeader | undefined => {
  try {
    const decoded = jwt.decode(rawJwtToken, { complete: true });

    if (!isDefined(decoded)) {
      return undefined;
    }

    return decoded.header;
  } catch {
    return undefined;
  }
};
