import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import {
  type SlackThreadReference,
  type SlackThreadSubscription,
} from 'src/logic-functions/types/slack-thread-subscription.type';
import { getSlackThreadKvKey } from 'src/logic-functions/utils/get-slack-thread-kv-key';

export const isSlackThreadActive = async ({
  channelId,
  threadTimestamp,
}: SlackThreadReference): Promise<boolean> => {
  if (!isNonEmptyString(channelId) || !isNonEmptyString(threadTimestamp)) {
    return false;
  }

  const key = getSlackThreadKvKey({ channelId, threadTimestamp });
  const subscription = await kv.get<SlackThreadSubscription>(key);

  if (subscription === null || !isNumber(subscription.expiresAt)) {
    return false;
  }

  if (subscription.expiresAt <= Date.now()) {
    await kv.delete(key);

    return false;
  }

  return true;
};
