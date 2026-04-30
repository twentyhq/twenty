import { type AGENT_CHAT_THREAD_GROUP_BY } from '@/ai/constants/AgentChatThreadGroupBy';

export type AgentChatThreadGroupBy =
  (typeof AGENT_CHAT_THREAD_GROUP_BY)[keyof typeof AGENT_CHAT_THREAD_GROUP_BY];
