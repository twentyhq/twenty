import { isNumber } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { type SlackSuggestedPromptsClaim } from 'src/logic-functions/types/slack-suggested-prompts-claim.type';
import { getSlackSuggestedPromptsKvKey } from 'src/logic-functions/utils/get-slack-suggested-prompts-kv-key';

const SLACK_SUGGESTED_PROMPTS_TTL_MS = 6 * 60 * 60 * 1000;

export const claimSlackSuggestedPrompts = async (
  channelId: string,
): Promise<boolean> => {
  const key = getSlackSuggestedPromptsKvKey(channelId);
  const existingClaim = await kv.get<SlackSuggestedPromptsClaim>(key);

  if (
    existingClaim !== null &&
    isNumber(existingClaim.expiresAt) &&
    existingClaim.expiresAt > Date.now()
  ) {
    return false;
  }

  await kv.set(key, {
    expiresAt: Date.now() + SLACK_SUGGESTED_PROMPTS_TTL_MS,
  } satisfies SlackSuggestedPromptsClaim);

  return true;
};
