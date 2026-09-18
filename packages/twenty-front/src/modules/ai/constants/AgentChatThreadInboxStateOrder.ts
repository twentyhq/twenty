import { AGENT_CHAT_THREAD_INBOX_STATE } from '@/ai/constants/AgentChatThreadInboxState';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';

export const AGENT_CHAT_THREAD_INBOX_STATE_ORDER: AgentChatThreadInboxState[] =
  [
    AGENT_CHAT_THREAD_INBOX_STATE.OPEN,
    AGENT_CHAT_THREAD_INBOX_STATE.SNOOZED,
    AGENT_CHAT_THREAD_INBOX_STATE.DONE,
  ];
