import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { type SlackThreadReference } from 'src/logic-functions/types/slack-thread-reference.type';
import { type SlackThreadSubscription } from 'src/logic-functions/types/slack-thread-subscription.type';
import { getSlackThreadKvKey } from 'src/logic-functions/utils/get-slack-thread-kv-key';

// read-only: a lapsed subscription keeps reporting 'expired' until the caller
// clears it with clearSlackThreadSubscription, so a failed expiry nudge can be
// retried on the next follow-up instead of being lost
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

  return subscription.expiresAt <= Date.now() ? 'expired' : 'active';
};
