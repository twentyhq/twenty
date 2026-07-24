import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { SLACK_THREAD_SUBSCRIPTION_TTL_MS } from 'src/logic-functions/constants/slack-thread-subscription';
import { getSlackThreadKvKey } from 'src/logic-functions/utils/get-slack-thread-kv-key';

type SlackThreadSubscription = {
  expiresAt: number;
};

type SlackThreadArgs = {
  channelId: string;
  threadTimestamp: string;
};

const buildSubscription = (): SlackThreadSubscription => ({
  expiresAt: Date.now() + SLACK_THREAD_SUBSCRIPTION_TTL_MS,
});

export const subscribeSlackThread = async ({
  channelId,
  threadTimestamp,
}: SlackThreadArgs): Promise<void> => {
  if (!isNonEmptyString(channelId) || !isNonEmptyString(threadTimestamp)) {
    return;
  }

  await kv.set(
    getSlackThreadKvKey({ channelId, threadTimestamp }),
    buildSubscription(),
  );
};

export const isSlackThreadActive = async ({
  channelId,
  threadTimestamp,
}: SlackThreadArgs): Promise<boolean> => {
  if (!isNonEmptyString(channelId) || !isNonEmptyString(threadTimestamp)) {
    return false;
  }

  const key = getSlackThreadKvKey({ channelId, threadTimestamp });
  const subscription = await kv.get<SlackThreadSubscription>(key);

  if (subscription === null || typeof subscription.expiresAt !== 'number') {
    return false;
  }

  if (subscription.expiresAt <= Date.now()) {
    await kv.delete(key);

    return false;
  }

  return true;
};
