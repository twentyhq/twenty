import { kv } from 'twenty-sdk/logic-function';

import { getSlackSuggestedPromptsKvKey } from 'src/logic-functions/utils/get-slack-suggested-prompts-kv-key';

export const releaseSlackSuggestedPrompts = async (
  channelId: string,
): Promise<void> => {
  await kv.delete(getSlackSuggestedPromptsKvKey(channelId));
};
