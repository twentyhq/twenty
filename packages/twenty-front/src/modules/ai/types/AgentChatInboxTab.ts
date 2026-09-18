import { type AGENT_CHAT_INBOX_TAB } from '@/ai/constants/AgentChatInboxTab';

export type AgentChatInboxTab =
  (typeof AGENT_CHAT_INBOX_TAB)[keyof typeof AGENT_CHAT_INBOX_TAB];
