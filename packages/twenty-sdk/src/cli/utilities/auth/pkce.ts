import crypto from 'node:crypto';

export type PkceChallenge = {
  codeVerifier: string;
  codeChallenge: string;
};

export const generatePkceChallenge = (): PkceChallenge => {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  return { codeVerifier, codeChallenge };
};
