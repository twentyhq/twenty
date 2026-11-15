import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatUsageState } from '@/ai/states/aiChatUsageFamilyState';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';

const toDisplayCredits = (internalCredits: number | string | undefined) =>
  Number(internalCredits ?? 0) / INTERNAL_CREDITS_PER_DISPLAY_CREDIT;

export const getAiChatUsageFromThread = (
  thread: Pick<
    AiChatThreadRecord,
    | 'conversationSize'
    | 'contextWindowTokens'
    | 'totalCacheReadTokens'
    | 'totalInputTokens'
    | 'totalOutputTokens'
    | 'totalInputCredits'
    | 'totalOutputCredits'
  >,
): AiChatUsageState | null => {
  const conversationSize = thread.conversationSize ?? 0;

  if (conversationSize <= 0 || !isDefined(thread.contextWindowTokens)) {
    return null;
  }

  return {
    lastMessage: null,
    cachedInputTokens: Number(thread.totalCacheReadTokens ?? 0),
    conversationSize,
    contextWindowTokens: thread.contextWindowTokens,
    inputTokens: thread.totalInputTokens ?? 0,
    outputTokens: thread.totalOutputTokens ?? 0,
    inputCredits: toDisplayCredits(thread.totalInputCredits),
    outputCredits: toDisplayCredits(thread.totalOutputCredits),
  };
};
