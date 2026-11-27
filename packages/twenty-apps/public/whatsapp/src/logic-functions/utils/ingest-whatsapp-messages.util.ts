import { type AppMessageChannel } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type WhatsappIngestResult } from 'src/logic-functions/types/whatsapp-ingest-result.type';
import { ingestWhatsappChatMessages } from 'src/logic-functions/utils/ingest-whatsapp-chat-messages.util';
import { isWhatsappChatSelected } from 'src/logic-functions/utils/is-whatsapp-chat-selected.util';
import { isWhatsappGroupChat } from 'src/logic-functions/utils/is-whatsapp-group-chat.util';
import { mapWhatsappMessages } from 'src/logic-functions/utils/map-whatsapp-messages.util';
import { resolveWhatsappChatPersons } from 'src/logic-functions/utils/resolve-whatsapp-chat-persons.util';
import { setWhatsappChatPersonAvatars } from 'src/logic-functions/utils/set-whatsapp-chat-person-avatars.util';
import { toWhatsappCounterparts } from 'src/logic-functions/utils/to-whatsapp-counterparts.util';
import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

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
