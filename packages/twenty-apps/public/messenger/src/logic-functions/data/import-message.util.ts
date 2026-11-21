import {
  ingestMessages,
  type IngestMessageParticipant,
} from 'twenty-sdk/logic-function';

import { uploadIncomingAttachments } from 'src/logic-functions/data/upload-incoming-attachments.util';
import { type MessengerWebhookMessage } from 'src/logic-functions/types/messenger-webhook.type';

export const importMessage = async ({
  messageChannelId,
  pageHandle,
  pageScopedId,
  personId,
  message,
  receivedAt,
}: {
  messageChannelId: string;
  pageHandle: string;
  pageScopedId: string;
  personId: string;
  message: MessengerWebhookMessage;
  receivedAt: Date;
}) => {
  // echoes are messages the Page sent, from Twenty or from Meta Business Suite
  const isSentByPage = message.is_echo === true;
  // Twenty marks a message outgoing only when its sender handle is exactly the channel handle
  const pageParticipant = { handle: pageHandle };
  const customerParticipant = { handle: pageScopedId, personId };
  const participants: IngestMessageParticipant[] = isSentByPage
    ? [
        { role: 'FROM', ...pageParticipant },
        { role: 'TO', ...customerParticipant },
      ]
    : [
        { role: 'FROM', ...customerParticipant },
        { role: 'TO', ...pageParticipant },
      ];

  // ingestion skips a mid it already holds, so retries and echoes of Twenty's own replies import once
  await ingestMessages({
    messageChannelId,
    messages: [
      {
        externalId: message.mid,
        threadExternalId: pageScopedId,
        text: message.text ?? '',
        receivedAt,
        participants,
        attachments: await uploadIncomingAttachments(message),
      },
    ],
  });
};
