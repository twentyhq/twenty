import { kv } from 'twenty-sdk/logic-function';

import { getSlackChannelWelcomeKvKey } from 'src/logic-functions/utils/get-slack-channel-welcome-kv-key';

export const releaseSlackChannelWelcome = async (
  channelId: string,
): Promise<void> => {
  await kv.delete(getSlackChannelWelcomeKvKey(channelId));
};
