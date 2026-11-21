import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type SendAppMessagePayload,
  type SendAppMessageResult,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { MESSENGER_LOGIC_FUNCTION_SEND_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildFailedReplyNotificationText } from 'src/logic-functions/data/build-failed-reply-notification-text.util';
import { findLatestIncomingMessage } from 'src/logic-functions/data/find-latest-incoming-message.util';
import { findMessageChannelByIdOrThrow } from 'src/logic-functions/data/find-message-channel-by-id-or-throw.util';
import { getOutgoingAttachmentTypeOrThrow } from 'src/logic-functions/data/get-outgoing-attachment-type-or-throw.util';
import { getPageAccessTokenOrThrow } from 'src/logic-functions/data/get-page-access-token-or-throw.util';
import { getReplyMessagingType } from 'src/logic-functions/data/get-reply-messaging-type.util';
import { GraphApiError } from 'src/logic-functions/data/graph-api-error';
import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import { sendInboxNotification } from 'src/logic-functions/data/send-inbox-notification.util';
import { sendMessengerAttachment } from 'src/logic-functions/data/send-messenger-attachment.util';

const sendReply = async ({
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
  const replyMessagingType = getReplyMessagingType({
    lastCustomerMessageAt: latestIncomingMessage?.receivedAt,
  });

  if (!isDefined(replyMessagingType)) {
    throw new Error(
      "Messenger only allows replies within 7 days of the customer's last message.",
    );
  }

  const pageAccessToken = await getPageAccessTokenOrThrow({
    connectedAccountId,
    pageId,
  });

  const send = async () => {
    const messageIds: string[] = [];

    if (isNonEmptyString(text.trim())) {
      const { message_id } = await graphApiRequest<{ message_id: string }>({
        accessToken: pageAccessToken,
        method: 'POST',
        path: `${pageId}/messages`,
        data: {
          recipient: { id: threadExternalId },
          ...replyMessagingType,
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
          replyMessagingType,
        }),
      );
    }

    return messageIds;
  };

  let messageIds: string[];

  try {
    messageIds = await send();
  } catch (error) {
    if (
      error instanceof GraphApiError &&
      replyMessagingType.messaging_type === 'MESSAGE_TAG'
    ) {
      throw new Error(
        `Replies more than 24 hours after the customer's last message need Meta to approve the Human Agent feature for your Meta app. ${error.message}`,
      );
    }

    throw error;
  }

  const [externalId] = messageIds;

  if (!isDefined(externalId)) {
    throw new Error('A Messenger reply needs text or an attachment');
  }

  return { externalId };
};

// the sender sees the error in Twenty; the chosen members also hear about replies sent by agents or workflows
const handler = async (
  payload: SendAppMessagePayload,
): Promise<SendAppMessageResult> => {
  try {
    return await sendReply(payload);
  } catch (error) {
    const [recipient] = payload.recipients;

    await sendInboxNotification({
      threadKey: `reply_failed:${payload.messageChannelId}`,
      idempotencyKey: `reply_failed:${payload.idempotencyKey}`,
      title: 'Messenger reply not sent',
      text: buildFailedReplyNotificationText({
        recipientName:
          recipient?.displayName ?? recipient?.handle ?? payload.threadExternalId,
        reason: error instanceof Error ? error.message : String(error),
        replyText: payload.text,
      }),
    });

    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: MESSENGER_LOGIC_FUNCTION_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'send-message',
  description:
    'Sends a reply written in Twenty, with its attachments, to its Messenger conversation: a standard reply within 24 hours, with the human agent tag up to 7 days',
  timeoutSeconds: 60,
  handler,
});
