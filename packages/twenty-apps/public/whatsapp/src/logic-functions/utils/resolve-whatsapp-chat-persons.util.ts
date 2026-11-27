import { isDefined } from 'twenty-sdk/utils';

import { type WhatsappChatPersons } from 'src/logic-functions/types/whatsapp-chat-persons.type';
import { type WhatsappCounterpart } from 'src/logic-functions/types/whatsapp-counterpart.type';
import { createWhatsappPerson } from 'src/logic-functions/utils/create-whatsapp-person.util';
import { findPersonIdsByWhatsappPhone } from 'src/logic-functions/utils/find-person-ids-by-whatsapp-phone.util';
import { isWhatsappContactCreationAllowed } from 'src/logic-functions/utils/is-whatsapp-contact-creation-allowed.util';
import { splitWhatsappUserName } from 'src/logic-functions/utils/split-whatsapp-user-name.util';
import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';

const createPersonOrWarn = async ({
  counterpart: { user, handle },
  isGroupChat,
}: {
  counterpart: WhatsappCounterpart;
  isGroupChat: boolean;
}): Promise<string | undefined> => {
  // Group members are all imported, so one WhatsApp only knows by number is named after it
  const name =
    splitWhatsappUserName(user) ??
    (isGroupChat ? { firstName: handle, lastName: '' } : undefined);

  if (!isDefined(name)) {
    return undefined;
  }

  try {
    return await createWhatsappPerson({ ...name, handle });
  } catch (error) {
    console.warn(
      `[whatsapp] could not create the person for ${handle}: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};

export const resolveWhatsappChatPersons = async ({
  settings,
  counterparts,
  hasUserSentMessage,
  isGroupChat,
}: {
  settings: WhatsappSettings;
  counterparts: WhatsappCounterpart[];
  hasUserSentMessage: () => Promise<boolean>;
  isGroupChat: boolean;
}): Promise<WhatsappChatPersons | undefined> => {
  const personIdByHandle = new Map<string, string>();
  const unmatchedCounterparts: WhatsappCounterpart[] = [];

  for (const counterpart of counterparts) {
    const [personId] = await findPersonIdsByWhatsappPhone(counterpart.handle);

    if (isDefined(personId)) {
      personIdByHandle.set(counterpart.handle, personId);
    } else {
      unmatchedCounterparts.push(counterpart);
    }
  }

  const isContactRequired =
    settings.importPolicy === 'CONTACTS_ONLY' ||
    (isGroupChat && settings.importPolicy !== 'SELECTED');

  if (isContactRequired && personIdByHandle.size === 0) {
    return undefined;
  }

  const matchedPersonCount = personIdByHandle.size;

  if (
    unmatchedCounterparts.length === 0 ||
    !isWhatsappContactCreationAllowed({
      policy: settings.contactAutoCreationPolicy,
      hasUserSentMessage:
        settings.contactAutoCreationPolicy === 'SENT' &&
        (await hasUserSentMessage()),
    })
  ) {
    return { personIdByHandle, matchedPersonCount, createdPersonCount: 0 };
  }

  let createdPersonCount = 0;

  for (const counterpart of unmatchedCounterparts) {
    const personId = await createPersonOrWarn({ counterpart, isGroupChat });

    if (isDefined(personId)) {
      personIdByHandle.set(counterpart.handle, personId);
      createdPersonCount += 1;
    }
  }

  return { personIdByHandle, matchedPersonCount, createdPersonCount };
};
