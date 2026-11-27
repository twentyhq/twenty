import { isNonEmptyString } from '@sniptt/guards';
import {
  type AppMessageChannel,
  type IngestMessage,
  type IngestedMessage,
  ingestMessages,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { INGEST_MESSAGES_MAX_BATCH_SIZE } from 'src/constants/ingest-messages-max-batch-size.constant';
import { type WhatsappCounterpart } from 'src/logic-functions/types/whatsapp-counterpart.type';
import { type WhatsappIngestResult } from 'src/logic-functions/types/whatsapp-ingest-result.type';
import { buildWhatsappChatSubject } from 'src/logic-functions/utils/build-whatsapp-chat-subject.util';
import { createWhatsappPerson } from 'src/logic-functions/utils/create-whatsapp-person.util';
import { findPersonIdsByWhatsappPhone } from 'src/logic-functions/utils/find-person-ids-by-whatsapp-phone.util';
import { importWhatsappMessageAttachments } from 'src/logic-functions/utils/import-whatsapp-message-attachments.util';
import { isWhatsappContactCreationAllowed } from 'src/logic-functions/utils/is-whatsapp-contact-creation-allowed.util';
import { isWhatsappChatSelected } from 'src/logic-functions/utils/is-whatsapp-chat-selected.util';
import { isWhatsappGroupChat } from 'src/logic-functions/utils/is-whatsapp-group-chat.util';
import { limitWhatsappMessageParticipants } from 'src/logic-functions/utils/limit-whatsapp-message-participants.util';
import { mapUnipileMessageToIngestMessage } from 'src/logic-functions/utils/map-unipile-message-to-ingest-message.util';
import { setMissingWhatsappPersonAvatars } from 'src/logic-functions/utils/set-missing-whatsapp-person-avatars.util';
import { splitWhatsappUserName } from 'src/logic-functions/utils/split-whatsapp-user-name.util';
import { toWhatsappCounterparts } from 'src/logic-functions/utils/to-whatsapp-counterparts.util';
import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

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

export type WhatsappChatPersons = {
  personIdByHandle: Map<string, string>;
  matchedPersonCount: number;
  createdPersonCount: number;
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

export const mapWhatsappMessages = ({
  messages,
  channelHandle,
  counterparts,
}: {
  messages: UnipileMessage[];
  channelHandle: string;
  counterparts: WhatsappCounterpart[];
}): { message: UnipileMessage; ingestMessage: IngestMessage }[] =>
  messages.flatMap((message) => {
    const ingestMessage = mapUnipileMessageToIngestMessage({
      message,
      channelHandle,
      counterparts,
    });

    return isDefined(ingestMessage) ? [{ message, ingestMessage }] : [];
  });

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

export const ingestWhatsappChatMessages = async ({
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
  counterparts: WhatsappCounterpart[];
  personIdByHandle: Map<string, string>;
  messages: UnipileMessage[];
}): Promise<
  Pick<WhatsappIngestResult, 'ingestedMessageCount' | 'importedAttachmentCount'>
> => {
  const mappedMessages = mapWhatsappMessages({
    messages,
    channelHandle: channel.handle,
    counterparts,
  });
  const subject = buildWhatsappChatSubject(chat);
  const ingestMessagesInput = mappedMessages.map(({ ingestMessage }) => ({
    ...ingestMessage,
    subject,
    participants: limitWhatsappMessageParticipants({
      channelHandle: channel.handle,
      participants: ingestMessage.participants.map((participant) => {
        const personId = personIdByHandle.get(participant.handle);

        return isDefined(personId) ? { ...participant, personId } : participant;
      }),
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

  const importedAttachmentCount = await importWhatsappMessageAttachments({
    unipileAccountId,
    messages: mappedMessages
      .map(({ message }) => message)
      .filter((message) => messageExternalIdsToAttach.has(message.id)),
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

export const ingestWhatsappMessages = async ({
  unipileAccountId,
  attachmentDeadlineAtMs,
  channel,
  settings,
  chat,
  counterparts: counterpartUsers,
  messages,
}: {
  unipileAccountId: string;
  attachmentDeadlineAtMs: number;
  channel: Pick<AppMessageChannel, 'id' | 'handle'>;
  settings: WhatsappSettings;
  chat: UnipileChat;
  counterparts: UnipileUser[];
  messages: UnipileMessage[];
}): Promise<WhatsappIngestResult> => {
  const emptyResult = {
    ingestedMessageCount: 0,
    matchedPersonCount: 0,
    createdPersonCount: 0,
    importedAttachmentCount: 0,
  };

  if (!isWhatsappChatSelected({ settings, chatId: chat.id })) {
    return { ...emptyResult, skippedReason: 'NOT_SELECTED' };
  }

  const counterparts = toWhatsappCounterparts(counterpartUsers);

  if (counterparts.length < counterpartUsers.length) {
    console.log(
      `[whatsapp] chat ${chat.id}: ${counterparts.length} of ${counterpartUsers.length} members have a visible phone number`,
    );
  }

  const mappedMessages = mapWhatsappMessages({
    messages,
    channelHandle: channel.handle,
    counterparts,
  });

  if (mappedMessages.length === 0) {
    const hasContent = messages.some(
      (message) => !message.is_event && !message.is_deleted,
    );

    return {
      ...emptyResult,
      skippedReason: hasContent ? 'NO_PHONE' : 'NO_MESSAGES',
    };
  }

  if (counterparts.length === 0) {
    return { ...emptyResult, skippedReason: 'NO_PHONE' };
  }

  const chatPersons = await resolveWhatsappChatPersons({
    settings,
    counterparts,
    hasUserSentMessage: async () =>
      mappedMessages.some(({ message }) => message.is_sender),
    isGroupChat: isWhatsappGroupChat(chat),
  });

  if (!isDefined(chatPersons)) {
    return { ...emptyResult, skippedReason: 'NO_CONTACT' };
  }

  const ingestResult = await ingestWhatsappChatMessages({
    unipileAccountId,
    attachmentDeadlineAtMs,
    channel,
    chat,
    counterparts,
    personIdByHandle: chatPersons.personIdByHandle,
    messages: mappedMessages.map(({ message }) => message),
  });

  await setWhatsappChatPersonAvatars({
    counterparts,
    personIdByHandle: chatPersons.personIdByHandle,
    deadlineAtMs: attachmentDeadlineAtMs,
  });

  return {
    ...ingestResult,
    matchedPersonCount: chatPersons.matchedPersonCount,
    createdPersonCount: chatPersons.createdPersonCount,
  };
};
