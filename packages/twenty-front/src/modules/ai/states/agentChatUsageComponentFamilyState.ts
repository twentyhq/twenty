import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';
import { type AiChatUsageMetadata } from 'twenty-shared/ai';

export type AgentChatLastMessageUsage = Omit<
  AiChatUsageMetadata,
  'conversationSize'
>;

export type AgentChatUsageState = {
  lastMessage: AgentChatLastMessageUsage | null;
  cachedInputTokens: number;
  conversationSize: number;
  contextWindowTokens: number;
  inputTokens: number;
  outputTokens: number;
  inputCredits: number;
  outputCredits: number;
};

export const agentChatUsageComponentFamilyState =
  createAtomComponentFamilyState<
    AgentChatUsageState | null,
    { threadId: string | null }
  >({
    key: 'agentChatUsageComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
