import { isNonEmptyString } from '@sniptt/guards';
import {
  ingestMessages,
  type IngestMessageParticipant,
} from 'twenty-sdk/logic-function';

import { buildIncomingMessageText } from 'src/logic-functions/data/build-incoming-message-text.util';
import { uploadIncomingMedia } from 'src/logic-functions/data/upload-incoming-media.util';
import { type LineMessage } from 'src/logic-functions/types/line-webhook.type';

// ingestion skips a message id it already holds, so retried jobs import once
export const importMessage = async ({
  accessToken,
  messageChannelId,
  botUserId,
  chatId,
  chatName,
  sender,
  message,
  receivedAt,
}: {
  accessToken: string;
  messageChannelId: string;
  botUserId: string;
  chatId: string;
  chatName: string | undefined;
  sender: Omit<IngestMessageParticipant, 'role'>;
  message: LineMessage;
  receivedAt: Date;
}) => {
  const { attachments, note } = await uploadIncomingMedia({
    accessToken,
    message,
  });

  await ingestMessages({
    messageChannelId,
    messages: [
      {
        externalId: message.id,
        threadExternalId: chatId,
        subject: chatName,
        text: [buildIncomingMessageText(message), note]
          .filter(isNonEmptyString)
          .join(' '),
        receivedAt,
        participants: [
          { role: 'FROM', ...sender },
          { role: 'TO', handle: botUserId },
        ],
        attachments,
      },
    ],
  });
};
