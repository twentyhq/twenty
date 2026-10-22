import { useCallback } from 'react';
import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';

import { useLoadAgentChatThreadsInFilterStatus } from '@/ai/hooks/useLoadAgentChatThreadsInFilterStatus';

export const useRefreshAgentChatThreadsInFilterStatus = () => {
  const { loadAgentChatThreadsInFilterStatus } =
    useLoadAgentChatThreadsInFilterStatus();

  const refreshAgentChatThreadsInFilterStatus = useCallback(
    (filterStatus: AgentChatThreadFilterStatus) =>
      loadAgentChatThreadsInFilterStatus({ filterStatus, mode: 'first' }),
    [loadAgentChatThreadsInFilterStatus],
  );

  return { refreshAgentChatThreadsInFilterStatus };
};
