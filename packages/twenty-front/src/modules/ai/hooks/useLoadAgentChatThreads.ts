import { useCallback } from 'react';

import { useLoadAgentChatThreadsPage } from '@/ai/hooks/useLoadAgentChatThreadsPage';
import { appendAgentChatThreadIds } from '@/ai/utils/appendAgentChatThreadIds';

export const useLoadAgentChatThreads = () => {
  const { loadAgentChatThreadsPage } = useLoadAgentChatThreadsPage();

  const loadAgentChatThreads = useCallback(
    (mode: 'refresh' | 'fetch-more') =>
      loadAgentChatThreadsPage({
        getPageRequest: (list) => {
          if (mode === 'refresh') {
            return { lastCursor: null };
          }

          return list?.hasNextPage
            ? { lastCursor: list.endCursor ?? null }
            : undefined;
        },
        buildNextList: ({ list, page }) => {
          if (mode === 'refresh') {
            return {
              threadIds: page.threads.map(({ id }) => id),
              hasNextPage: page.hasNextPage,
              endCursor: page.endCursor,
            };
          }

          return {
            ...list,
            threadIds: appendAgentChatThreadIds({
              threadIds: list?.threadIds ?? [],
              threads: page.threads,
            }),
            hasNextPage: page.hasNextPage,
            endCursor: page.endCursor,
          };
        },
      }),
    [loadAgentChatThreadsPage],
  );

  return { loadAgentChatThreads };
};
