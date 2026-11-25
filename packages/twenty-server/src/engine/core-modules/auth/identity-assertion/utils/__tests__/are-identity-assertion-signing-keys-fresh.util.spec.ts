import { IDENTITY_ASSERTION_SIGNING_KEYS_MAX_AGE_MS } from 'src/engine/core-modules/auth/identity-assertion/constants/identity-assertion-signing-keys-max-age-ms.constant';
import { areIdentityAssertionSigningKeysFresh } from 'src/engine/core-modules/auth/identity-assertion/utils/are-identity-assertion-signing-keys-fresh.util';

const NOW = 1_800_000_000_000;

describe('areIdentityAssertionSigningKeysFresh', () => {
  it('should be false when the keys were never fetched', () => {
    expect(
      areIdentityAssertionSigningKeysFresh({ fetchedAt: undefined, now: NOW }),
    ).toBe(false);
  });

  it('should be true when the keys were just fetched', () => {
    expect(
      areIdentityAssertionSigningKeysFresh({ fetchedAt: NOW, now: NOW }),
    ).toBe(true);
  });

  it('should be true until the maximum age is reached', () => {
    expect(
      areIdentityAssertionSigningKeysFresh({
        fetchedAt: NOW - IDENTITY_ASSERTION_SIGNING_KEYS_MAX_AGE_MS,
        now: NOW,
      }),
    ).toBe(true);
  });

  it('should be false past the maximum age', () => {
    expect(
      areIdentityAssertionSigningKeysFresh({
        fetchedAt: NOW - IDENTITY_ASSERTION_SIGNING_KEYS_MAX_AGE_MS - 1,
        now: NOW,
      }),
    ).toBe(false);
  });
});
