import { type AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER } from '@/ai/constants/AgentChatThreadLastActivityFilter';

export type AgentChatThreadLastActivityFilter =
  (typeof AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER)[keyof typeof AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER];
