import { isDefined } from 'twenty-shared/utils';

import { IDENTITY_ASSERTION_SIGNING_KEYS_MAX_AGE_MS } from 'src/engine/core-modules/auth/identity-assertion/constants/identity-assertion-signing-keys-max-age-ms.constant';

export const areIdentityAssertionSigningKeysFresh = ({
  fetchedAt,
  now,
}: {
  fetchedAt: number | undefined;
  now: number;
}): boolean =>
  isDefined(fetchedAt) &&
  now - fetchedAt <= IDENTITY_ASSERTION_SIGNING_KEYS_MAX_AGE_MS;
