import { timingSafeEqual } from 'crypto';

import { hashClaimStateNonce } from 'src/engine/core-modules/application/application-registration/utils/hash-claim-state-nonce.util';

export const claimStateNonceMatches = ({
  nonce,
  expectedNonceHash,
}: {
  nonce: string;
  expectedNonceHash: string;
}): boolean => {
  const actual = Buffer.from(hashClaimStateNonce({ nonce }), 'hex');
  const expected = Buffer.from(expectedNonceHash, 'hex');

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
};
