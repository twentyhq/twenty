import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

import { AGENT_CHAT_OPEN_THREAD_FILTER_STATUSES } from '@/ai/constants/AgentChatOpenThreadFilterStatuses';

export const isAgentChatOpenThreadFilterStatus = (
  filterStatus: AgentChatThreadFilterStatus,
) => AGENT_CHAT_OPEN_THREAD_FILTER_STATUSES.includes(filterStatus);
