import { isNonEmptyString } from '@sniptt/guards';
import {
  type AppMessageChannel,
  ingestMessages,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { INGEST_MESSAGES_MAX_BATCH_SIZE } from 'src/constants/ingest-messages-max-batch-size.constant';
import { buildLinkedinChatSubject } from 'src/logic-functions/utils/build-linkedin-chat-subject.util';
import { buildLinkedinProfileHandle } from 'src/logic-functions/utils/build-linkedin-profile-handle.util';
import { createLinkedinPerson } from 'src/logic-functions/utils/create-linkedin-person.util';
import { hasPersonNamedLikeLinkedinUser } from 'src/logic-functions/utils/has-person-named-like-linkedin-user.util';
import { importLinkedinMessageAttachments } from 'src/logic-functions/utils/import-linkedin-message-attachments.util';
import { isLinkedinContactCreationAllowed } from 'src/logic-functions/utils/is-linkedin-contact-creation-allowed.util';
import { isLinkedinGroupChat } from 'src/logic-functions/utils/is-linkedin-group-chat.util';
import { mapUnipileMessageToIngestMessage } from 'src/logic-functions/utils/map-unipile-message-to-ingest-message.util';
import { matchLinkedinParticipantPersonId } from 'src/logic-functions/utils/match-linkedin-participant-person-id.util';
import { splitLinkedinUserName } from 'src/logic-functions/utils/split-linkedin-user-name.util';
import { type LinkedinCounterpartResolver } from 'src/logic-functions/types/linkedin-counterpart-resolver.type';
import { type LinkedinIngestResult } from 'src/logic-functions/types/linkedin-ingest-result.type';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

const resolvePersonIdByHandle = async ({
  settings,
  counterparts,
  resolveCounterpart,
  hasUserSentMessage,
  isGroupChat,
}: {
  settings: LinkedinSettings;
  counterparts: UnipileUser[];
  resolveCounterpart: LinkedinCounterpartResolver;
  hasUserSentMessage: boolean;
  isGroupChat: boolean;
}): Promise<
  | {
      counterparts: UnipileUser[];
      personIdByHandle: Map<string, string>;
      matchedPersonCount: number;
      createdPersonCount: number;
    }
  | undefined
> => {
  const isContactRequired =
    settings.importPolicy === 'CONTACTS_ONLY' || isGroupChat;
  const resolvedCounterparts = await Promise.all(
    counterparts.map((counterpart) =>
      resolveCounterpart({
        user: counterpart,
        shouldLookUp: isContactRequired
          ? () => hasPersonNamedLikeLinkedinUser(counterpart)
          : undefined,
      }),
    ),
  );
  const personIdByHandle = new Map<string, string>();
  const unmatchedCounterparts: UnipileUser[] = [];

  for (const counterpart of resolvedCounterparts) {
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

  if (isContactRequired && personIdByHandle.size === 0) {
    return undefined;
  }

  let matchedPersonCount = personIdByHandle.size;

  if (
    !isLinkedinContactCreationAllowed({
      policy: settings.contactAutoCreationPolicy,
      hasUserSentMessage,
    })
  ) {
    return {
      counterparts: resolvedCounterparts,
      personIdByHandle,
      matchedPersonCount,
      createdPersonCount: 0,
    };
  }

  const creatableCounterparts = await Promise.all(
    unmatchedCounterparts.map((counterpart) =>
      isNonEmptyString(counterpart.public_identifier)
        ? counterpart
        : resolveCounterpart({ user: counterpart }),
    ),
  );

  let createdPersonCount = 0;

  for (const [index, counterpart] of creatableCounterparts.entries()) {
    const handle = buildLinkedinProfileHandle(counterpart);
    const personId =
      counterpart.public_identifier ===
      unmatchedCounterparts[index].public_identifier
        ? undefined
        : await matchLinkedinParticipantPersonId({
            user: counterpart,
            isNameMatchingEnabled: settings.isNameMatchingEnabled,
          });

    if (isDefined(personId)) {
      personIdByHandle.set(handle, personId);
      matchedPersonCount += 1;

      continue;
    }

    const { firstName, lastName } = splitLinkedinUserName(counterpart);

    if (
      isNonEmptyString(firstName) &&
      isNonEmptyString(counterpart.public_identifier)
    ) {
      personIdByHandle.set(
        handle,
        await createLinkedinPerson({ firstName, lastName, handle }),
      );
      createdPersonCount += 1;
    }
  }

  return {
    counterparts: resolvedCounterparts.map(
      (counterpart) =>
        creatableCounterparts.find(
          (creatableCounterpart) => creatableCounterpart.id === counterpart.id,
        ) ?? counterpart,
    ),
    personIdByHandle,
    matchedPersonCount,
    createdPersonCount,
  };
};

export const ingestLinkedinMessages = async ({
  unipileAccountId,
  attachmentDeadlineAtMs,
  channel,
  settings,
  chat,
  counterparts,
  resolveCounterpart,
  messages,
}: {
  unipileAccountId: string;
  attachmentDeadlineAtMs: number;
  channel: Pick<AppMessageChannel, 'id' | 'handle'>;
  settings: LinkedinSettings;
  chat: UnipileChat;
  counterparts: UnipileUser[];
  resolveCounterpart: LinkedinCounterpartResolver;
  messages: UnipileMessage[];
}): Promise<LinkedinIngestResult> => {
  const isGroupChat = isLinkedinGroupChat(chat);

  const emptyResult = {
    ingestedMessageCount: 0,
    matchedPersonCount: 0,
    createdPersonCount: 0,
    importedAttachmentCount: 0,
  };

  if (isGroupChat && !settings.areGroupChatsImported) {
    return { ...emptyResult, skippedReason: 'GROUP_CHATS_OFF' };
  }

  const ingestableMessages = messages.filter(
    (message) => !message.is_event && !message.is_deleted,
  );

  if (ingestableMessages.length === 0) {
    return { ...emptyResult, skippedReason: 'NO_MESSAGES' };
  }

  const resolvedPersons = await resolvePersonIdByHandle({
    settings,
    counterparts,
    resolveCounterpart,
    hasUserSentMessage: ingestableMessages.some((message) => message.is_sender),
    isGroupChat,
  });

  if (!isDefined(resolvedPersons)) {
    return { ...emptyResult, skippedReason: 'NO_CONTACT' };
  }

  const {
    counterparts: resolvedCounterparts,
    personIdByHandle,
    matchedPersonCount,
    createdPersonCount,
  } = resolvedPersons;

  const subject = buildLinkedinChatSubject(chat);
  const ingestMessagesInput = ingestableMessages
    .map((message) =>
      mapUnipileMessageToIngestMessage({
        message: {
          ...message,
          sender: message.is_sender
            ? message.sender
            : (resolvedCounterparts.find(
                (counterpart) => counterpart.id === message.sender_id,
              ) ?? message.sender),
        },
        channelHandle: channel.handle,
        counterparts: resolvedCounterparts,
      }),
    )
    .filter(isDefined)
    .map((ingestMessage) => ({
      ...ingestMessage,
      subject,
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

  const importedAttachmentCount = await importLinkedinMessageAttachments({
    unipileAccountId,
    messages: ingestableMessages,
    deadlineAtMs: attachmentDeadlineAtMs,
    onAttachmentFile: async ({
      messageExternalId,
      type,
      mimeType,
      content,
    }) => {
      console.log(
        `[linkedin] message ${messageExternalId}: imported ${type} attachment (${mimeType}, ${content.byteLength}B), not stored yet`,
      );
    },
  });

  return {
    ingestedMessageCount: ingestMessagesInput.length,
    matchedPersonCount,
    createdPersonCount,
    importedAttachmentCount,
  };
};
