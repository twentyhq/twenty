import { ingestMessages } from 'twenty-sdk/logic-function';

import { buildIncomingMessageText } from 'src/logic-functions/data/build-incoming-message-text.util';
import { type LineMessage } from 'src/logic-functions/types/line-webhook.type';

// ingestion skips a message id it already holds, so retried jobs import once
export const importMessage = async ({
  messageChannelId,
  botUserId,
  userId,
  personId,
  message,
  receivedAt,
}: {
  messageChannelId: string;
  botUserId: string;
  userId: string;
  personId: string;
  message: LineMessage;
  receivedAt: Date;
}) => {
  await ingestMessages({
    messageChannelId,
    messages: [
      {
        externalId: message.id,
        threadExternalId: userId,
        text: buildIncomingMessageText(message),
        receivedAt,
        participants: [
          { role: 'FROM', handle: userId, personId },
          { role: 'TO', handle: botUserId },
        ],
      },
    ],
  });
};
