import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { SLACK_THREAD_SUBSCRIPTION_TTL_MS } from 'src/logic-functions/constants/slack-thread-subscription-ttl-ms';
import {
  type SlackThreadReference,
  type SlackThreadSubscription,
} from 'src/logic-functions/types/slack-thread-subscription.type';
import { getSlackThreadKvKey } from 'src/logic-functions/utils/get-slack-thread-kv-key';

export const subscribeSlackThread = async ({
  channelId,
  threadTimestamp,
}: SlackThreadReference): Promise<void> => {
  if (!isNonEmptyString(channelId) || !isNonEmptyString(threadTimestamp)) {
    return;
  }

  const subscription: SlackThreadSubscription = {
    expiresAt: Date.now() + SLACK_THREAD_SUBSCRIPTION_TTL_MS,
  };

  await kv.set(
    getSlackThreadKvKey({ channelId, threadTimestamp }),
    subscription,
  );
};
