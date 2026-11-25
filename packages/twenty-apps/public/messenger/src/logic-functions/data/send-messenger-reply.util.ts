import { isNonEmptyString } from '@sniptt/guards';
import { type SendAppMessagePayload } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { findLastCustomerMessageAt } from 'src/logic-functions/data/find-last-customer-message-at.util';
import { findMessageChannelOrThrow } from 'src/logic-functions/data/find-message-channel-or-throw.util';
import { getOutgoingAttachmentTypeOrThrow } from 'src/logic-functions/data/get-outgoing-attachment-type-or-throw.util';
import { getPageAccessTokenOrThrow } from 'src/logic-functions/data/get-page-access-token-or-throw.util';
import { getReplyMessagingType } from 'src/logic-functions/data/get-reply-messaging-type.util';
import { GraphApiError } from 'src/logic-functions/data/graph-api.error';
import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import { sendMessengerAttachment } from 'src/logic-functions/data/send-messenger-attachment.util';
import { rememberSentAttachmentMessages } from 'src/logic-functions/data/sent-attachment-message.util';

// the human agent tag is meant for people answering by hand, so only replies from the thread view may use it
export const sendMessengerReply = async ({
  connectedAccountId,
  messageChannelId,
  threadExternalId,
  text,
  attachments,
  isHumanAgentTagAllowed,
}: Pick<
  SendAppMessagePayload,
  | 'connectedAccountId'
  | 'messageChannelId'
  | 'threadExternalId'
  | 'text'
  | 'attachments'
> & { isHumanAgentTagAllowed: boolean }): Promise<{ externalId: string }> => {
  const messageChannel = await findMessageChannelOrThrow({
    connectedAccountId,
    messageChannelId,
  });
  const pageId = messageChannel.handle;
  // checked before sending anything, so a bad file never leaves a reply half sent
  const attachmentTypes = attachments.map(getOutgoingAttachmentTypeOrThrow);

  const replyMessagingType = getReplyMessagingType({
    lastCustomerMessageAt: await findLastCustomerMessageAt({
      messageChannelId,
      threadExternalId,
    }),
  });

  if (!isDefined(replyMessagingType)) {
    throw new Error(
      "Messenger only allows replies within 7 days of the customer's last message.",
    );
  }

  if (
    replyMessagingType.messaging_type === 'MESSAGE_TAG' &&
    !isHumanAgentTagAllowed
  ) {
    throw new Error(
      "The customer's last message is more than 24 hours old, so only a person can reply, from the conversation in Twenty.",
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

  const [externalId, ...attachmentMessageIds] = messageIds;

  if (!isDefined(externalId)) {
    throw new Error('A Messenger reply needs text or an attachment');
  }

  await rememberSentAttachmentMessages(attachmentMessageIds);

  return { externalId };
};
