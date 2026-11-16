import * as jwt from 'jsonwebtoken';

export const getCloudflareAccessAssertionKeyId = (
  assertion: string,
): string | undefined => jwt.decode(assertion, { complete: true })?.header.kid;
