import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { buildLinkedinProfileHandle } from 'src/logic-functions/utils/build-linkedin-profile-handle.util';
import { createLinkedinPerson } from 'src/logic-functions/utils/create-linkedin-person.util';
import { findPersonIdsByLinkedinHandle } from 'src/logic-functions/utils/find-person-ids-by-linkedin-handle.util';
import { findUnlinkedPersonIdsByName } from 'src/logic-functions/utils/find-unlinked-person-ids-by-name.util';
import { isLinkedinContactCreationAllowed } from 'src/logic-functions/utils/is-linkedin-contact-creation-allowed.util';
import { recordLinkedinPersonReview } from 'src/logic-functions/utils/record-linkedin-person-review.util';
import { setPersonLinkedinLink } from 'src/logic-functions/utils/set-person-linkedin-link.util';
import { splitLinkedinUserName } from 'src/logic-functions/utils/split-linkedin-user-name.util';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export const resolveLinkedinParticipantPersonId = async ({
  connectedAccountId,
  user,
  settings,
  hasUserSentMessage,
  lastMessageAt,
}: {
  connectedAccountId: string;
  user: UnipileUser;
  settings: LinkedinSettings;
  hasUserSentMessage: boolean;
  lastMessageAt: string;
}): Promise<string | undefined> => {
  const handle = buildLinkedinProfileHandle(user);
  const [linkedPersonId] = await findPersonIdsByLinkedinHandle(handle);

  if (isDefined(linkedPersonId)) {
    return linkedPersonId;
  }

  const { firstName, lastName } = splitLinkedinUserName(user);

  if (settings.isNameMatchingEnabled) {
    const namesakePersonIds = await findUnlinkedPersonIdsByName({
      firstName,
      lastName,
    });

    if (namesakePersonIds.length === 1) {
      await setPersonLinkedinLink({ personId: namesakePersonIds[0], handle });

      return namesakePersonIds[0];
    }

    if (namesakePersonIds.length > 1) {
      await recordLinkedinPersonReview({
        connectedAccountId,
        personReview: {
          handle,
          displayName: user.display_name,
          firstName,
          lastName,
          candidatePersonIds: namesakePersonIds,
          lastMessageAt,
        },
      });

      return undefined;
    }
  }

  if (
    !isNonEmptyString(firstName) ||
    !isLinkedinContactCreationAllowed({
      policy: settings.contactAutoCreationPolicy,
      hasUserSentMessage,
    })
  ) {
    return undefined;
  }

  return createLinkedinPerson({ firstName, lastName, handle });
};
