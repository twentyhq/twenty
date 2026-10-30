import { isNonEmptyString } from '@sniptt/guards';
import {
  type AppMessageChannel,
  ingestMessages,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { INGEST_MESSAGES_MAX_BATCH_SIZE } from 'src/constants/ingest-messages-max-batch-size.constant';
import { buildLinkedinProfileHandle } from 'src/logic-functions/utils/build-linkedin-profile-handle.util';
import { createLinkedinPerson } from 'src/logic-functions/utils/create-linkedin-person.util';
import { isLinkedinContactCreationAllowed } from 'src/logic-functions/utils/is-linkedin-contact-creation-allowed.util';
import { mapUnipileMessageToIngestMessage } from 'src/logic-functions/utils/map-unipile-message-to-ingest-message.util';
import { matchLinkedinParticipantPersonId } from 'src/logic-functions/utils/match-linkedin-participant-person-id.util';
import { splitLinkedinUserName } from 'src/logic-functions/utils/split-linkedin-user-name.util';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

const resolvePersonIdByHandle = async ({
  settings,
  counterparts,
  hasUserSentMessage,
}: {
  settings: LinkedinSettings;
  counterparts: UnipileUser[];
  hasUserSentMessage: boolean;
}): Promise<Map<string, string> | undefined> => {
  const personIdByHandle = new Map<string, string>();
  const unmatchedCounterparts: UnipileUser[] = [];

  for (const counterpart of counterparts) {
    const personId = await matchLinkedinParticipantPersonId({
      user: counterpart,
      isNameMatchingEnabled: settings.isNameMatchingEnabled,
    });

    if (isDefined(personId)) {
      personIdByHandle.set(buildLinkedinProfileHandle(counterpart), personId);
    } else {
      unmatchedCounterparts.push(counterpart);
    }
  }

  if (
    settings.importPolicy === 'CONTACTS_ONLY' &&
    personIdByHandle.size === 0
  ) {
    return undefined;
  }

  if (
    !isLinkedinContactCreationAllowed({
      policy: settings.contactAutoCreationPolicy,
      hasUserSentMessage,
    })
  ) {
    return personIdByHandle;
  }

  for (const counterpart of unmatchedCounterparts) {
    const { firstName, lastName } = splitLinkedinUserName(counterpart);

    if (isNonEmptyString(firstName)) {
      const handle = buildLinkedinProfileHandle(counterpart);

      personIdByHandle.set(
        handle,
        await createLinkedinPerson({ firstName, lastName, handle }),
      );
    }
  }

  return personIdByHandle;
};

// counterparts must already carry their public identifier, so handles match the ones People are linked on
export const ingestLinkedinMessages = async ({
  channel,
  settings,
  counterparts,
  messages,
}: {
  channel: Pick<AppMessageChannel, 'id' | 'handle'>;
  settings: LinkedinSettings;
  counterparts: UnipileUser[];
  messages: UnipileMessage[];
}): Promise<number> => {
  const ingestableMessages = messages.filter(
    (message) => !message.is_event && !message.is_deleted,
  );

  if (ingestableMessages.length === 0) {
    return 0;
  }

  // Contacts only skips chats where nobody is already in Twenty, before anyone gets created
  const personIdByHandle = await resolvePersonIdByHandle({
    settings,
    counterparts,
    hasUserSentMessage: ingestableMessages.some((message) => message.is_sender),
  });

  if (!isDefined(personIdByHandle)) {
    return 0;
  }

  const ingestMessagesInput = ingestableMessages
    .map((message) =>
      mapUnipileMessageToIngestMessage({
        message: {
          ...message,
          sender: message.is_sender
            ? message.sender
            : (counterparts.find(
                (counterpart) => counterpart.id === message.sender_id,
              ) ?? message.sender),
        },
        channelHandle: channel.handle,
        counterparts,
      }),
    )
    .filter(isDefined)
    .map((ingestMessage) => ({
      ...ingestMessage,
      participants: ingestMessage.participants.map((participant) => {
        const personId = personIdByHandle.get(participant.handle);

        return isDefined(personId) ? { ...participant, personId } : participant;
      }),
    }));

  for (
    let batchStart = 0;
    batchStart < ingestMessagesInput.length;
    batchStart += INGEST_MESSAGES_MAX_BATCH_SIZE
  ) {
    await ingestMessages({
      messageChannelId: channel.id,
      messages: ingestMessagesInput.slice(
        batchStart,
        batchStart + INGEST_MESSAGES_MAX_BATCH_SIZE,
      ),
    });
  }

  return ingestMessagesInput.length;
};
