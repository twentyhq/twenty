import { claimSlackKvThrottle } from 'src/logic-functions/utils/claim-slack-kv-throttle';
import { getSlackSuggestedPromptsKvKey } from 'src/logic-functions/utils/get-slack-suggested-prompts-kv-key';

const SLACK_SUGGESTED_PROMPTS_TTL_MS = 6 * 60 * 60 * 1000;

export const claimSlackSuggestedPrompts = async (
  channelId: string,
): Promise<boolean> =>
  claimSlackKvThrottle({
    key: getSlackSuggestedPromptsKvKey(channelId),
    ttlMs: SLACK_SUGGESTED_PROMPTS_TTL_MS,
  });
