import { createHash, randomBytes } from 'node:crypto';

export const createPkcePair = () => {
  const codeVerifier = randomBytes(32).toString('base64url');

  return {
    codeVerifier,
    codeChallenge: createHash('sha256')
      .update(codeVerifier)
      .digest('base64url'),
  };
};
