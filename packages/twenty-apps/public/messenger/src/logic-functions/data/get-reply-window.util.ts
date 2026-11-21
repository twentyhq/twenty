import { isDefined } from 'twenty-sdk/utils';

import { getReplyMessagingType } from 'src/logic-functions/data/get-reply-messaging-type.util';
import { type MessengerConversationMessage } from 'src/logic-functions/types/messenger-conversation.type';

export type ReplyWindow = 'OPEN' | 'HUMAN_ONLY' | 'CLOSED';

// tells the assistant whether it may send, or only a person can still reply by hand
export const getReplyWindow = (
  messages: MessengerConversationMessage[],
  now = new Date(),
): ReplyWindow => {
  const customerMessageTimes = messages.flatMap(({ direction, sentAt }) =>
    direction === 'INCOMING' && isDefined(sentAt) ? [new Date(sentAt)] : [],
  );
  const lastCustomerMessageAt =
    customerMessageTimes[customerMessageTimes.length - 1];
  const replyMessagingType = getReplyMessagingType({ lastCustomerMessageAt, now });

  if (!isDefined(replyMessagingType)) {
    return 'CLOSED';
  }

  return replyMessagingType.messaging_type === 'RESPONSE' ? 'OPEN' : 'HUMAN_ONLY';
};
