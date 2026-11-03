import { isDefined } from 'twenty-sdk/utils';

import { type LinkedinCounterpartResolver } from 'src/logic-functions/types/linkedin-counterpart-resolver.type';
import { withLinkedinPublicIdentifier } from 'src/logic-functions/utils/with-linkedin-public-identifier.util';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export const createLinkedinCounterpartResolver = (
  unipileAccountId: string,
): LinkedinCounterpartResolver => {
  const resolvedCounterpartById = new Map<string, UnipileUser>();

  return async ({ user, shouldLookUp }) => {
    const resolvedCounterpart = resolvedCounterpartById.get(user.id);

    if (isDefined(resolvedCounterpart)) {
      return resolvedCounterpart;
    }

    let isLookupDeclined = false;
    const counterpart = await withLinkedinPublicIdentifier({
      unipileAccountId,
      user,
      shouldLookUp: isDefined(shouldLookUp)
        ? async () => {
            isLookupDeclined = !(await shouldLookUp());

            return !isLookupDeclined;
          }
        : undefined,
    });

    if (!isLookupDeclined) {
      resolvedCounterpartById.set(user.id, counterpart);
    }

    return counterpart;
  };
};
