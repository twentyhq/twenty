import { isDefined } from 'twenty-shared/utils';

import { IDENTITY_ASSERTION_SIGNING_KEYS_MIN_REFETCH_INTERVAL_MS } from 'src/engine/core-modules/auth/identity-assertion/constants/identity-assertion-signing-keys-min-refetch-interval-ms.constant';
import { areIdentityAssertionSigningKeysFresh } from 'src/engine/core-modules/auth/identity-assertion/utils/are-identity-assertion-signing-keys-fresh.util';

export const shouldFetchIdentityAssertionSigningKeys = ({
  fetchedAt,
  fetchAttemptedAt,
  isSigningKeyKnown,
  now,
}: {
  fetchedAt: number | undefined;
  fetchAttemptedAt: number | undefined;
  isSigningKeyKnown: boolean;
  now: number;
}): boolean => {
  if (
    isDefined(fetchAttemptedAt) &&
    now - fetchAttemptedAt <=
      IDENTITY_ASSERTION_SIGNING_KEYS_MIN_REFETCH_INTERVAL_MS
  ) {
    return false;
  }

  // Issuers rotate their keys, so an unknown key id is worth a refetch.
  return (
    !areIdentityAssertionSigningKeysFresh({ fetchedAt, now }) ||
    !isSigningKeyKnown
  );
};
