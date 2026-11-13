import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatUsageState } from '@/ai/states/agentChatUsageFamilyState';
import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';

const toDisplayCredits = (internalCredits: number | string | undefined) =>
  Number(internalCredits ?? 0) / INTERNAL_CREDITS_PER_DISPLAY_CREDIT;

export const getAgentChatUsageFromThread = (
  thread: Pick<
    InboxThreadRecord,
    | 'conversationSize'
    | 'contextWindowTokens'
    | 'totalCacheReadTokens'
    | 'totalInputTokens'
    | 'totalOutputTokens'
    | 'totalInputCredits'
    | 'totalOutputCredits'
  >,
): AgentChatUsageState | null => {
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
