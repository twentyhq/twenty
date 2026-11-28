import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type WhatsappCounterpart } from 'src/logic-functions/types/whatsapp-counterpart.type';
import { setMissingWhatsappPersonAvatars } from 'src/logic-functions/utils/set-missing-whatsapp-person-avatars.util';

export const setWhatsappChatPersonAvatars = ({
  counterparts,
  personIdByHandle,
  deadlineAtMs,
}: {
  counterparts: WhatsappCounterpart[];
  personIdByHandle: Map<string, string>;
  deadlineAtMs: number;
}): Promise<void> =>
  setMissingWhatsappPersonAvatars({
    avatars: counterparts.flatMap(({ user, handle }) => {
      const personId = personIdByHandle.get(handle);

      return isDefined(personId) && isNonEmptyString(user.public_picture_url)
        ? [{ personId, pictureUrl: user.public_picture_url }]
        : [];
    }),
    deadlineAtMs,
  });
