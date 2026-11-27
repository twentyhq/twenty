import * as jwt from 'jsonwebtoken';

export const getIdentityAssertionKeyId = (
  assertion: string,
): string | undefined => jwt.decode(assertion, { complete: true })?.header.kid;
