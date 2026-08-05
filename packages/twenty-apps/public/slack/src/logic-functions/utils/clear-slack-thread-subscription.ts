import { kv } from 'twenty-sdk/logic-function';

import { type SlackThreadReference } from 'src/logic-functions/types/slack-thread-reference.type';
import { getSlackThreadKvKey } from 'src/logic-functions/utils/get-slack-thread-kv-key';

export const clearSlackThreadSubscription = async ({
  channelId,
  threadTimestamp,
}: SlackThreadReference): Promise<void> => {
  await kv.delete(getSlackThreadKvKey({ channelId, threadTimestamp }));
};
