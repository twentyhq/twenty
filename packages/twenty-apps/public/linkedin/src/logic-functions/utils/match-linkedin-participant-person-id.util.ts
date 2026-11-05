import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { buildLinkedinProfileHandle } from 'src/logic-functions/utils/build-linkedin-profile-handle.util';
import { findPersonIdsByLinkedinHandle } from 'src/logic-functions/utils/find-person-ids-by-linkedin-handle.util';
import { findUnlinkedPersonIdsByName } from 'src/logic-functions/utils/find-unlinked-person-ids-by-name.util';
import { setUnlinkedPersonLinkedinLink } from 'src/logic-functions/utils/set-person-linkedin-link.util';
import { splitLinkedinUserName } from 'src/logic-functions/utils/split-linkedin-user-name.util';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

const findLinkedPersonId = async (
  handle: string,
): Promise<string | undefined> => {
  const linkedPersonIds = await findPersonIdsByLinkedinHandle(handle);

  console.log(
    `[linkedin] ${handle}: ${linkedPersonIds.length} person(s) linked${linkedPersonIds.length > 0 ? ` (${linkedPersonIds.join(', ')})` : ''}`,
  );

  return linkedPersonIds[0];
};

export const matchLinkedinParticipantPersonId = async ({
  user,
  isNameMatchingEnabled,
}: {
  user: UnipileUser;
  isNameMatchingEnabled: boolean;
}): Promise<string | undefined> => {
  const handle = buildLinkedinProfileHandle(user);
  const linkedPersonId = await findLinkedPersonId(handle);

  if (
    isDefined(linkedPersonId) ||
    !isNameMatchingEnabled ||
    !isNonEmptyString(user.public_identifier)
  ) {
    return linkedPersonId;
  }

  const namesakePersonIds = await findUnlinkedPersonIdsByName(
    splitLinkedinUserName(user),
  );

  if (namesakePersonIds.length !== 1) {
    return undefined;
  }

  if (
    await setUnlinkedPersonLinkedinLink({
      personId: namesakePersonIds[0],
      handle,
    })
  ) {
    return namesakePersonIds[0];
  }

  return findLinkedPersonId(handle);
};
