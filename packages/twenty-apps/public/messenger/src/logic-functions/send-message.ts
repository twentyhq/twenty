import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type SendAppMessagePayload,
  type SendAppMessageResult,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { MESSENGER_LOGIC_FUNCTION_SEND_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findLatestIncomingMessage } from 'src/logic-functions/data/find-latest-incoming-message.util';
import { findMessageChannelByIdOrThrow } from 'src/logic-functions/data/find-message-channel-by-id-or-throw.util';
import { getOutgoingAttachmentTypeOrThrow } from 'src/logic-functions/data/get-outgoing-attachment-type-or-throw.util';
import { getPageAccessTokenOrThrow } from 'src/logic-functions/data/get-page-access-token-or-throw.util';
import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import { isWithinStandardMessagingWindow } from 'src/logic-functions/data/is-within-standard-messaging-window.util';
import { sendMessengerAttachment } from 'src/logic-functions/data/send-messenger-attachment.util';

const handler = async ({
  connectedAccountId,
  messageChannelId,
  threadExternalId,
  text,
  attachments,
}: SendAppMessagePayload): Promise<SendAppMessageResult> => {
  const messageChannel = await findMessageChannelByIdOrThrow({
    connectedAccountId,
    messageChannelId,
  });
  const pageId = messageChannel.handle;
  // checked before sending anything, so a bad file never leaves a reply half sent
  const attachmentTypes = attachments.map(getOutgoingAttachmentTypeOrThrow);

  const latestIncomingMessage = await findLatestIncomingMessage({
    messageChannelId,
    threadExternalId,
  });

  if (
    !isWithinStandardMessagingWindow({
      lastCustomerMessageAt: latestIncomingMessage?.receivedAt,
    })
  ) {
    throw new Error(
      "Messenger only allows replies within 24 hours of the customer's last message.",
    );
  }

  const pageAccessToken = await getPageAccessTokenOrThrow({
    connectedAccountId,
    pageId,
  });
  const messageIds: string[] = [];

  if (isNonEmptyString(text.trim())) {
    const { message_id } = await graphApiRequest<{ message_id: string }>({
      accessToken: pageAccessToken,
      method: 'POST',
      path: `${pageId}/messages`,
      data: {
        recipient: { id: threadExternalId },
        messaging_type: 'RESPONSE',
        message: { text },
      },
    });

    messageIds.push(message_id);
  }

  for (const [index, attachment] of attachments.entries()) {
    messageIds.push(
      await sendMessengerAttachment({
        pageAccessToken,
        pageId,
        recipientId: threadExternalId,
        attachment,
        attachmentType: attachmentTypes[index] ?? 'file',
      }),
    );
  }

  const [externalId] = messageIds;

  if (!isDefined(externalId)) {
    throw new Error('A Messenger reply needs text or an attachment');
  }

  return { externalId };
};

export default defineLogicFunction({
  universalIdentifier: MESSENGER_LOGIC_FUNCTION_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'send-message',
  description:
    'Sends a reply written in Twenty, with its attachments, to its Messenger conversation within the 24 hour window',
  timeoutSeconds: 60,
  handler,
});
