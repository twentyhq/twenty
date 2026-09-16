import { isDefined } from 'twenty-shared/utils';
import { type AgentChatUsageState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { type AgentChatThread } from '~/generated-metadata/graphql';

export const getAgentChatUsageFromThread = (
  thread: Pick<
    AgentChatThread,
    | 'totalCacheReadTokens'
    | 'conversationSize'
    | 'contextWindowTokens'
    | 'totalInputTokens'
    | 'totalOutputTokens'
    | 'totalInputCredits'
    | 'totalOutputCredits'
  >,
): AgentChatUsageState | null => {
  if (thread.conversationSize <= 0 || !isDefined(thread.contextWindowTokens)) {
    return null;
  }
  return {
    lastMessage: null,
    cachedInputTokens: thread.totalCacheReadTokens,
    conversationSize: thread.conversationSize,
    contextWindowTokens: thread.contextWindowTokens,
    inputTokens: thread.totalInputTokens,
    outputTokens: thread.totalOutputTokens,
    inputCredits: thread.totalInputCredits,
    outputCredits: thread.totalOutputCredits,
  };
};
