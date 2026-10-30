import { isDefined } from 'twenty-sdk/utils';

import { buildLinkedinProfileHandle } from 'src/logic-functions/utils/build-linkedin-profile-handle.util';
import { findPersonIdsByLinkedinHandle } from 'src/logic-functions/utils/find-person-ids-by-linkedin-handle.util';
import { findUnlinkedPersonIdsByName } from 'src/logic-functions/utils/find-unlinked-person-ids-by-name.util';
import { setPersonLinkedinLink } from 'src/logic-functions/utils/set-person-linkedin-link.util';
import { splitLinkedinUserName } from 'src/logic-functions/utils/split-linkedin-user-name.util';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

// Namesakes are never guessed between: the member links the right one by adding the profile link
export const matchLinkedinParticipantPersonId = async ({
  user,
  isNameMatchingEnabled,
}: {
  user: UnipileUser;
  isNameMatchingEnabled: boolean;
}): Promise<string | undefined> => {
  const handle = buildLinkedinProfileHandle(user);
  const [linkedPersonId] = await findPersonIdsByLinkedinHandle(handle);

  if (isDefined(linkedPersonId) || !isNameMatchingEnabled) {
    return linkedPersonId;
  }

  const namesakePersonIds = await findUnlinkedPersonIdsByName(
    splitLinkedinUserName(user),
  );

  if (namesakePersonIds.length !== 1) {
    return undefined;
  }

  await setPersonLinkedinLink({ personId: namesakePersonIds[0], handle });

  return namesakePersonIds[0];
};
