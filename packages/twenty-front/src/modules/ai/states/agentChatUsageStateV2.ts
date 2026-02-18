import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export type AgentChatLastMessageUsage = {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  inputCredits: number;
  outputCredits: number;
};

export type AgentChatUsageState = {
  lastMessage: AgentChatLastMessageUsage | null;
  conversationSize: number;
  contextWindowTokens: number;
  inputTokens: number;
  outputTokens: number;
  inputCredits: number;
  outputCredits: number;
};

export const agentChatUsageStateV2 = createStateV2<AgentChatUsageState | null>({
  key: 'agentChatUsageStateV2',
  defaultValue: null,
});
