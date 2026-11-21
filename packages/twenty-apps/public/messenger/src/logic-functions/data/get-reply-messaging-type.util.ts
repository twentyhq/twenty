import { isDefined } from 'twenty-sdk/utils';

import { MESSENGER_HUMAN_AGENT_WINDOW_MS } from 'src/constants/messenger-human-agent-window-ms.constant';
import { type ReplyMessagingType } from 'src/logic-functions/types/reply-messaging-type.type';
import { MESSENGER_STANDARD_MESSAGING_WINDOW_MS } from 'src/constants/messenger-standard-messaging-window-ms.constant';

// replies from the thread view are written by people, which is what the human agent tag allows
export const getReplyMessagingType = ({
  lastCustomerMessageAt,
  now = new Date(),
}: {
  lastCustomerMessageAt: Date | undefined;
  now?: Date;
}): ReplyMessagingType | undefined => {
  if (!isDefined(lastCustomerMessageAt)) {
    return undefined;
  }

  const elapsedMs = now.getTime() - lastCustomerMessageAt.getTime();

  if (elapsedMs < MESSENGER_STANDARD_MESSAGING_WINDOW_MS) {
    return { messaging_type: 'RESPONSE' };
  }

  if (elapsedMs < MESSENGER_HUMAN_AGENT_WINDOW_MS) {
    return { messaging_type: 'MESSAGE_TAG', tag: 'HUMAN_AGENT' };
  }

  return undefined;
};
