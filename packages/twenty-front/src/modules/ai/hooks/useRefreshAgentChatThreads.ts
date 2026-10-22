import { useCallback } from 'react';

import { useLoadAgentChatThreads } from '@/ai/hooks/useLoadAgentChatThreads';

export const useRefreshAgentChatThreads = () => {
  const { loadAgentChatThreads } = useLoadAgentChatThreads();

  const refreshAgentChatThreads = useCallback(
    () => loadAgentChatThreads('refresh'),
    [loadAgentChatThreads],
  );

  return { refreshAgentChatThreads };
};
