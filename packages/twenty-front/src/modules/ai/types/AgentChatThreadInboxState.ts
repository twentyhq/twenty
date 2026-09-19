import { type AGENT_CHAT_THREAD_INBOX_STATE } from '@/ai/constants/AgentChatThreadInboxState';

export type AgentChatThreadInboxState =
  (typeof AGENT_CHAT_THREAD_INBOX_STATE)[keyof typeof AGENT_CHAT_THREAD_INBOX_STATE];
