import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  ingestMessages,
  type IngestMessageParticipant,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { buildIncomingMessageContent } from 'src/logic-functions/data/build-incoming-message-content.util';
import { findMessageByExternalId } from 'src/logic-functions/data/find-message-by-external-id.util';
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
  // checked before uploading, so retries and echoes of Twenty's own replies do not store the files again
  const existingMessage = await findMessageByExternalId({
    client: new CoreApiClient(),
    messageChannelId,
    externalId: message.mid,
  });

  if (isDefined(existingMessage)) {
    return;
  }

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

  const { text, fileAttachments } = buildIncomingMessageContent(message);

  // ingestion still skips a mid it already holds, for a duplicate that arrives while this one is uploading
  await ingestMessages({
    messageChannelId,
    messages: [
      {
        externalId: message.mid,
        threadExternalId: pageScopedId,
        text,
        receivedAt,
        participants,
        attachments: await uploadIncomingAttachments({
          messageId: message.mid,
          fileAttachments,
        }),
      },
    ],
  });
};
