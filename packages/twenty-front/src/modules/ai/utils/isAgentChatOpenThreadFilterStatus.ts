import { AGENT_CHAT_OPEN_THREAD_FILTER_STATUSES } from '@/ai/constants/AgentChatOpenThreadFilterStatuses';
import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';

export const isAgentChatOpenThreadFilterStatus = (
  filterStatus: AgentChatThreadFilterStatus,
) => AGENT_CHAT_OPEN_THREAD_FILTER_STATUSES.includes(filterStatus);
