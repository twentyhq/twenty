import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type LinkedinCounterpartResolver } from 'src/logic-functions/types/linkedin-counterpart-resolver.type';
import { withLinkedinPublicIdentifier } from 'src/logic-functions/utils/with-linkedin-public-identifier.util';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

// Remembers profiles LinkedIn could not resolve too, which the kv cache does not.
export const createLinkedinCounterpartResolver = (
  unipileAccountId: string,
): LinkedinCounterpartResolver => {
  const resolvedCounterpartById = new Map<string, UnipileUser>();

  return async (user, { shouldLookUp } = {}) => {
    const resolvedCounterpart = resolvedCounterpartById.get(user.id);

    if (isDefined(resolvedCounterpart)) {
      return resolvedCounterpart;
    }

    const counterpart = await withLinkedinPublicIdentifier({
      unipileAccountId,
      user,
      shouldLookUp,
    });

    // A declined lookup may still be wanted later in the same job.
    if (
      !isDefined(shouldLookUp) ||
      isNonEmptyString(counterpart.public_identifier)
    ) {
      resolvedCounterpartById.set(user.id, counterpart);
    }

    return counterpart;
  };
};
