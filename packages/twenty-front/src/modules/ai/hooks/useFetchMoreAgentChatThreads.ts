import { useCallback } from 'react';

import { useLoadAgentChatThreads } from '@/ai/hooks/useLoadAgentChatThreads';

export const useFetchMoreAgentChatThreads = () => {
  const { loadAgentChatThreads } = useLoadAgentChatThreads();

  const fetchMoreAgentChatThreads = useCallback(
    () => loadAgentChatThreads('fetch-more'),
    [loadAgentChatThreads],
  );

  return { fetchMoreAgentChatThreads };
};
