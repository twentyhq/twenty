import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';

export const AGENT_CHAT_OPEN_THREAD_FILTER_STATUSES: readonly AgentChatThreadFilterStatus[] =
  [
    AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
    AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT,
    AGENT_CHAT_THREAD_FILTER_STATUS.ASSIGNED,
    AGENT_CHAT_THREAD_FILTER_STATUS.MENTIONS,
  ];
