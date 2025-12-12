import { atom } from 'recoil';

export type AgentChatUsageState = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  contextWindowTokens: number;
  inputCostPer1kTokensInCents: number;
  outputCostPer1kTokensInCents: number;
};

export const agentChatUsageState = atom<AgentChatUsageState | null>({
  key: 'agentChatUsageState',
  default: null,
});
