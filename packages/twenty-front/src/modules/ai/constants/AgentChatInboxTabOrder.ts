import { AGENT_CHAT_INBOX_TAB } from '@/ai/constants/AgentChatInboxTab';
import { type AgentChatInboxTab } from '@/ai/types/AgentChatInboxTab';

export const AGENT_CHAT_INBOX_TAB_ORDER: AgentChatInboxTab[] = [
  AGENT_CHAT_INBOX_TAB.ALL,
  AGENT_CHAT_INBOX_TAB.ASSIGNED,
  AGENT_CHAT_INBOX_TAB.SUBSCRIBED,
  AGENT_CHAT_INBOX_TAB.DIRECT_MESSAGES,
];
