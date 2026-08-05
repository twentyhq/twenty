import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { type SlackThreadReference } from 'src/logic-functions/types/slack-thread-reference.type';
import { type SlackThreadSubscription } from 'src/logic-functions/types/slack-thread-subscription.type';
import { getSlackThreadKvKey } from 'src/logic-functions/utils/get-slack-thread-kv-key';

// 'expired' is returned exactly once per lapsed thread: the key is deleted on
// detection, so later messages in that thread resolve to 'none'
export type SlackThreadSubscriptionState = 'active' | 'expired' | 'none';

export const getSlackThreadSubscriptionState = async ({
  channelId,
  threadTimestamp,
}: SlackThreadReference): Promise<SlackThreadSubscriptionState> => {
  if (!isNonEmptyString(channelId) || !isNonEmptyString(threadTimestamp)) {
    return 'none';
  }

  const key = getSlackThreadKvKey({ channelId, threadTimestamp });
  const subscription = await kv.get<SlackThreadSubscription>(key);

  if (subscription === null || !isNumber(subscription.expiresAt)) {
    return 'none';
  }

  if (subscription.expiresAt <= Date.now()) {
    await kv.delete(key);

    return 'expired';
  }

  return 'active';
};
