import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { type SlackThreadReference } from 'src/logic-functions/types/slack-thread-reference.type';
import { type SlackThreadSubscription } from 'src/logic-functions/types/slack-thread-subscription.type';
import { getSlackThreadKvKey } from 'src/logic-functions/utils/get-slack-thread-kv-key';
import { hasKvEntryExpired } from 'src/logic-functions/utils/has-kv-entry-expired';

export const isSlackThreadActive = async ({
  channelId,
  threadTimestamp,
}: SlackThreadReference): Promise<boolean> => {
  if (!isNonEmptyString(channelId) || !isNonEmptyString(threadTimestamp)) {
    return false;
  }

  const key = getSlackThreadKvKey({ channelId, threadTimestamp });
  const subscription = await kv.get<SlackThreadSubscription>(key);

  if (subscription === null) {
    return false;
  }

  if (hasKvEntryExpired(subscription)) {
    await kv.delete(key);

    return false;
  }

  return true;
};
