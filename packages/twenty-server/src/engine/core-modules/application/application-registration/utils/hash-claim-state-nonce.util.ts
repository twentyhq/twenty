import { createHash, timingSafeEqual } from 'crypto';

export const hashClaimStateNonce = (nonce: string): string =>
  createHash('sha256').update(nonce).digest('hex');

export const claimStateNonceMatches = (
  nonce: string,
  expectedNonceHash: string,
): boolean => {
  const actual = Buffer.from(hashClaimStateNonce(nonce), 'hex');
  const expected = Buffer.from(expectedNonceHash, 'hex');

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
};
