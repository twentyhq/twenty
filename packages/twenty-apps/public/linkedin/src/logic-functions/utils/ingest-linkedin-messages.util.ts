import { isNonEmptyString } from '@sniptt/guards';
import {
  type AppMessageChannel,
  type IngestedMessage,
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
import { isLinkedinChatSelected } from 'src/logic-functions/utils/is-linkedin-chat-selected.util';
import { isLinkedinGroupChat } from 'src/logic-functions/utils/is-linkedin-group-chat.util';
import { mapUnipileMessageToIngestMessage } from 'src/logic-functions/utils/map-unipile-message-to-ingest-message.util';
import { matchLinkedinParticipantPersonId } from 'src/logic-functions/utils/match-linkedin-participant-person-id.util';
import { setMissingLinkedinPersonAvatars } from 'src/logic-functions/utils/set-missing-linkedin-person-avatars.util';
import { splitLinkedinUserName } from 'src/logic-functions/utils/split-linkedin-user-name.util';
import { type LinkedinCounterpartResolver } from 'src/logic-functions/types/linkedin-counterpart-resolver.type';
import { type LinkedinIngestResult } from 'src/logic-functions/types/linkedin-ingest-result.type';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export type LinkedinChatPersons = {
  counterparts: UnipileUser[];
  personIdByHandle: Map<string, string>;
  matchedPersonCount: number;
  createdPersonCount: number;
};

export const resolveLinkedinChatPersons = async ({
  settings,
  counterparts,
  resolveCounterpart,
  hasUserSentMessage,
  isGroupChat,
}: {
  settings: LinkedinSettings;
  counterparts: UnipileUser[];
  resolveCounterpart: LinkedinCounterpartResolver;
  hasUserSentMessage: () => Promise<boolean>;
  isGroupChat: boolean;
}): Promise<LinkedinChatPersons | undefined> => {
  const isContactRequired =
    settings.importPolicy === 'CONTACTS_ONLY' ||
    (isGroupChat && settings.importPolicy !== 'SELECTED');
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
    unmatchedCounterparts.length === 0 ||
    !isLinkedinContactCreationAllowed({
      policy: settings.contactAutoCreationPolicy,
      hasUserSentMessage:
        settings.contactAutoCreationPolicy === 'SENT' &&
        (await hasUserSentMessage()),
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

export const setLinkedinChatPersonAvatars = ({
  counterparts,
  personIdByHandle,
  deadlineAtMs,
}: {
  counterparts: UnipileUser[];
  personIdByHandle: Map<string, string>;
  deadlineAtMs: number;
}): Promise<void> =>
  setMissingLinkedinPersonAvatars({
    avatars: counterparts.flatMap((counterpart) => {
      const personId = personIdByHandle.get(
        buildLinkedinProfileHandle(counterpart),
      );

      return isDefined(personId) &&
        isNonEmptyString(counterpart.public_picture_url)
        ? [{ personId, pictureUrl: counterpart.public_picture_url }]
        : [];
    }),
    deadlineAtMs,
  });

export const isIngestableLinkedinMessage = (message: UnipileMessage): boolean =>
  !message.is_event && !message.is_deleted;

export const ingestLinkedinChatMessages = async ({
  unipileAccountId,
  attachmentDeadlineAtMs,
  channel,
  chat,
  counterparts,
  personIdByHandle,
  messages,
}: {
  unipileAccountId: string;
  attachmentDeadlineAtMs: number;
  channel: Pick<AppMessageChannel, 'id' | 'handle'>;
  chat: UnipileChat;
  counterparts: UnipileUser[];
  personIdByHandle: Map<string, string>;
  messages: UnipileMessage[];
}): Promise<
  Pick<LinkedinIngestResult, 'ingestedMessageCount' | 'importedAttachmentCount'>
> => {
  const ingestableMessages = messages.filter(isIngestableLinkedinMessage);
  const subject = buildLinkedinChatSubject(chat);
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
      subject,
      participants: ingestMessage.participants.map((participant) => {
        const personId = personIdByHandle.get(participant.handle);

        return isDefined(personId) ? { ...participant, personId } : participant;
      }),
    }));

  const ingestedMessages: IngestedMessage[] = [];

  for (
    let batchStart = 0;
    batchStart < ingestMessagesInput.length;
    batchStart += INGEST_MESSAGES_MAX_BATCH_SIZE
  ) {
    ingestedMessages.push(
      ...(await ingestMessages({
        messageChannelId: channel.id,
        messages: ingestMessagesInput.slice(
          batchStart,
          batchStart + INGEST_MESSAGES_MAX_BATCH_SIZE,
        ),
      })),
    );
  }

  const messageExternalIdsToAttach = new Set(
    ingestedMessages
      .filter((ingestedMessage) => !ingestedMessage.hasAttachments)
      .map((ingestedMessage) => ingestedMessage.externalId),
  );

  const importedAttachmentCount = await importLinkedinMessageAttachments({
    unipileAccountId,
    messages: ingestableMessages.filter((message) =>
      messageExternalIdsToAttach.has(message.id),
    ),
    deadlineAtMs: attachmentDeadlineAtMs,
    onMessageAttachments: async ({ messageExternalId, attachments }) => {
      const ingestMessage = ingestMessagesInput.find(
        (message) => message.externalId === messageExternalId,
      );

      if (!isDefined(ingestMessage)) {
        return;
      }

      await ingestMessages({
        messageChannelId: channel.id,
        messages: [{ ...ingestMessage, attachments }],
      });
    },
  });

  return {
    ingestedMessageCount: ingestMessagesInput.length,
    importedAttachmentCount,
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
  const emptyResult = {
    ingestedMessageCount: 0,
    matchedPersonCount: 0,
    createdPersonCount: 0,
    importedAttachmentCount: 0,
  };

  if (!isLinkedinChatSelected({ settings, chatId: chat.id })) {
    return { ...emptyResult, skippedReason: 'NOT_SELECTED' };
  }

  const ingestableMessages = messages.filter(isIngestableLinkedinMessage);

  if (ingestableMessages.length === 0) {
    return { ...emptyResult, skippedReason: 'NO_MESSAGES' };
  }

  const chatPersons = await resolveLinkedinChatPersons({
    settings,
    counterparts,
    resolveCounterpart,
    hasUserSentMessage: async () =>
      ingestableMessages.some((message) => message.is_sender),
    isGroupChat: isLinkedinGroupChat(chat),
  });

  if (!isDefined(chatPersons)) {
    return { ...emptyResult, skippedReason: 'NO_CONTACT' };
  }

  const ingestResult = await ingestLinkedinChatMessages({
    unipileAccountId,
    attachmentDeadlineAtMs,
    channel,
    chat,
    counterparts: chatPersons.counterparts,
    personIdByHandle: chatPersons.personIdByHandle,
    messages: ingestableMessages,
  });

  await setLinkedinChatPersonAvatars({
    counterparts: chatPersons.counterparts,
    personIdByHandle: chatPersons.personIdByHandle,
    deadlineAtMs: attachmentDeadlineAtMs,
  });

  return {
    ...ingestResult,
    matchedPersonCount: chatPersons.matchedPersonCount,
    createdPersonCount: chatPersons.createdPersonCount,
  };
};
