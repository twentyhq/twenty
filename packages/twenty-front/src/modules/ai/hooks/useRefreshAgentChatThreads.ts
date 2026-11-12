import { useCallback } from 'react';

import { useLoadAgentChatThreads } from '@/ai/hooks/useLoadAgentChatThreads';

export const useRefreshAgentChatThreads = () => {
  const { loadAgentChatThreads } = useLoadAgentChatThreads();

  const refreshAgentChatThreads = useCallback(
    ({
      shouldKeepFilterStatusPages = false,
    }: { shouldKeepFilterStatusPages?: boolean } = {}) =>
      loadAgentChatThreads(
        shouldKeepFilterStatusPages
          ? 'refresh-keeping-filter-status-pages'
          : 'refresh',
      ),
    [loadAgentChatThreads],
  );

  return { refreshAgentChatThreads };
};
