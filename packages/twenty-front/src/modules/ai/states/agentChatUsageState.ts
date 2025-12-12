import { atom } from 'recoil';

export type AgentChatUsageState = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  contextWindowTokens: number;
  inputCredits: number;
  outputCredits: number;
};

export const agentChatUsageState = atom<AgentChatUsageState | null>({
  key: 'agentChatUsageState',
  default: null,
});
