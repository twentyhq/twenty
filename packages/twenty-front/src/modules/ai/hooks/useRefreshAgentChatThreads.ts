import { useCallback } from 'react';

import { useLoadAgentChatThreads } from '@/ai/hooks/useLoadAgentChatThreads';

export const useRefreshAgentChatThreads = () => {
  const { loadAgentChatThreads } = useLoadAgentChatThreads();

  const refreshAgentChatThreads = useCallback(
    () => loadAgentChatThreads('refresh'),
    [loadAgentChatThreads],
  );

  const refreshAgentChatThreadsKeepingFilterStatusPages = useCallback(
    () => loadAgentChatThreads('refresh-keeping-filter-status-pages'),
    [loadAgentChatThreads],
  );

  return {
    refreshAgentChatThreads,
    refreshAgentChatThreadsKeepingFilterStatusPages,
  };
};
