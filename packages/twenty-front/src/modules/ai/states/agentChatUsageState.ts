import { atom } from 'recoil';

export type AgentChatUsageState = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  contextWindowTokens: number;
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
};

export const agentChatUsageState = atom<AgentChatUsageState | null>({
  key: 'agentChatUsageState',
  default: null,
});
