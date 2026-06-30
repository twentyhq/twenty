import { type AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';

export type AgentChatThreadFilterStatus =
  (typeof AGENT_CHAT_THREAD_FILTER_STATUS)[keyof typeof AGENT_CHAT_THREAD_FILTER_STATUS];
