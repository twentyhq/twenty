import { IDENTITY_ASSERTION_SIGNING_KEYS_MAX_AGE_MS } from 'src/engine/core-modules/auth/identity-assertion/constants/identity-assertion-signing-keys-max-age-ms.constant';
import { IDENTITY_ASSERTION_SIGNING_KEYS_MIN_REFETCH_INTERVAL_MS } from 'src/engine/core-modules/auth/identity-assertion/constants/identity-assertion-signing-keys-min-refetch-interval-ms.constant';
import { shouldFetchIdentityAssertionSigningKeys } from 'src/engine/core-modules/auth/identity-assertion/utils/should-fetch-identity-assertion-signing-keys.util';

const NOW = 1_800_000_000_000;
const PAST_MAX_AGE = NOW - IDENTITY_ASSERTION_SIGNING_KEYS_MAX_AGE_MS - 1;
const PAST_REFETCH_INTERVAL =
  NOW - IDENTITY_ASSERTION_SIGNING_KEYS_MIN_REFETCH_INTERVAL_MS - 1;

describe('shouldFetchIdentityAssertionSigningKeys', () => {
  it('should fetch when the keys were never fetched', () => {
    expect(
      shouldFetchIdentityAssertionSigningKeys({
        fetchedAt: undefined,
        fetchAttemptedAt: undefined,
        isSigningKeyKnown: false,
        now: NOW,
      }),
    ).toBe(true);
  });

  it('should not fetch when the keys are fresh and the key is known', () => {
    expect(
      shouldFetchIdentityAssertionSigningKeys({
        fetchedAt: PAST_REFETCH_INTERVAL,
        fetchAttemptedAt: PAST_REFETCH_INTERVAL,
        isSigningKeyKnown: true,
        now: NOW,
      }),
    ).toBe(false);
  });

  it('should fetch for an unknown key once the refetch interval has passed', () => {
    expect(
      shouldFetchIdentityAssertionSigningKeys({
        fetchedAt: PAST_REFETCH_INTERVAL,
        fetchAttemptedAt: PAST_REFETCH_INTERVAL,
        isSigningKeyKnown: false,
        now: NOW,
      }),
    ).toBe(true);
  });

  it('should not fetch for an unknown key within the refetch interval', () => {
    expect(
      shouldFetchIdentityAssertionSigningKeys({
        fetchedAt: NOW,
        fetchAttemptedAt: NOW,
        isSigningKeyKnown: false,
        now: NOW,
      }),
    ).toBe(false);
  });

  it('should fetch when the keys are past their maximum age', () => {
    expect(
      shouldFetchIdentityAssertionSigningKeys({
        fetchedAt: PAST_MAX_AGE,
        fetchAttemptedAt: PAST_MAX_AGE,
        isSigningKeyKnown: true,
        now: NOW,
      }),
    ).toBe(true);
  });

  it('should not retry a failed refresh within the refetch interval', () => {
    expect(
      shouldFetchIdentityAssertionSigningKeys({
        fetchedAt: PAST_MAX_AGE,
        fetchAttemptedAt: NOW,
        isSigningKeyKnown: true,
        now: NOW,
      }),
    ).toBe(false);
  });
});
