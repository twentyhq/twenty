import {
  type AppMessageChannel,
  type IngestedMessage,
  ingestMessages,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { INGEST_MESSAGES_MAX_BATCH_SIZE } from 'src/constants/ingest-messages-max-batch-size.constant';
import { type WhatsappCounterpart } from 'src/logic-functions/types/whatsapp-counterpart.type';
import { type WhatsappIngestResult } from 'src/logic-functions/types/whatsapp-ingest-result.type';
import { buildWhatsappChatSubject } from 'src/logic-functions/utils/build-whatsapp-chat-subject.util';
import { importWhatsappMessageAttachments } from 'src/logic-functions/utils/import-whatsapp-message-attachments.util';
import { limitWhatsappMessageParticipants } from 'src/logic-functions/utils/limit-whatsapp-message-participants.util';
import { mapWhatsappMessages } from 'src/logic-functions/utils/map-whatsapp-messages.util';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';

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
