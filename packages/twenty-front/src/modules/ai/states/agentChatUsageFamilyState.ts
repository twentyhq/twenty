import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
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

export const agentChatUsageFamilyState = createAtomFamilyState<
  AgentChatUsageState | null,
  { threadId: string | null }
>({
  key: 'agentChatUsageFamilyState',
  defaultValue: null,
});
