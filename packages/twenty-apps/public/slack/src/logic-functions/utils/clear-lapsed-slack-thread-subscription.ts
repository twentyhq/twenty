import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackThreadReference } from 'src/logic-functions/types/slack-thread-reference.type';
import { type SlackThreadSubscription } from 'src/logic-functions/types/slack-thread-subscription.type';
import { getSlackThreadKvKey } from 'src/logic-functions/utils/get-slack-thread-kv-key';
import { hasKvEntryExpired } from 'src/logic-functions/utils/has-kv-entry-expired';

export const clearLapsedSlackThreadSubscription = async ({
  channelId,
  threadTimestamp,
}: SlackThreadReference): Promise<void> => {
  const key = getSlackThreadKvKey({ channelId, threadTimestamp });
  const subscription = await kv.get<SlackThreadSubscription>(key);

  if (isDefined(subscription) && !hasKvEntryExpired(subscription)) {
    return;
  }

  await kv.delete(key);
};
