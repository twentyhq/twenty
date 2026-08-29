import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { type SlackThreadReference } from 'src/logic-functions/types/slack-thread-reference.type';
import { type SlackThreadSubscription } from 'src/logic-functions/types/slack-thread-subscription.type';
import { getSlackThreadKvKey } from 'src/logic-functions/utils/get-slack-thread-kv-key';

const SLACK_THREAD_SUBSCRIPTION_TTL_MS = 24 * 60 * 60 * 1000;

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
