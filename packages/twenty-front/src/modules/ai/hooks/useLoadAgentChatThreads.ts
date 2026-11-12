import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { useFetchAgentChatThreadsPage } from '@/ai/hooks/useFetchAgentChatThreadsPage';
import { useLoadAgentChatThreadsPage } from '@/ai/hooks/useLoadAgentChatThreadsPage';
import { agentChatFavoriteThreadsSelector } from '@/ai/states/selectors/agentChatFavoriteThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { type AgentChatThreadsPage } from '@/ai/types/AgentChatThreadsPage';
import { appendAgentChatThreadIds } from '@/ai/utils/appendAgentChatThreadIds';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

export const useLoadAgentChatThreads = () => {
  const store = useStore();
  const { fetchAgentChatThreadsPage } = useFetchAgentChatThreadsPage();
  const { loadAgentChatThreadsPage } = useLoadAgentChatThreadsPage();

  const loadFavoriteThreadsOutsidePage = useCallback(
    async (page: AgentChatThreadsPage) => {
      const pageThreadIds = page.threads.map(({ id }) => id);
      const unloadedFavoriteThreadIds = store
        .get(agentChatFavoriteThreadsSelector.atom)
        .filter(
          ({ id, conversationType }) =>
            !isDefined(conversationType) && !pageThreadIds.includes(id),
        )
        .map(({ id }) => id);
      const threads: AgentChatThreadRecord[] = [];
      const participants: AgentChatThreadParticipantFieldsFragment[] = [];

      if (!isNonEmptyArray(unloadedFavoriteThreadIds)) {
        return { threads, participants };
      }

      let favoriteCursor: string | null = null;

      do {
        const favoritePage = await fetchAgentChatThreadsPage({
          lastCursor: favoriteCursor,
          filter: { id: { in: unloadedFavoriteThreadIds } },
        });

        if (!isDefined(favoritePage)) {
          return undefined;
        }

        threads.push(...favoritePage.threads);
        participants.push(...favoritePage.participants);
        favoriteCursor = favoritePage.hasNextPage
          ? favoritePage.endCursor
          : null;
      } while (isDefined(favoriteCursor));

      return { threads, participants };
    },
    [fetchAgentChatThreadsPage, store],
  );

  const loadAgentChatThreads = useCallback(
    (mode: 'refresh' | 'refresh-keeping-filter-status-pages' | 'fetch-more') =>
      loadAgentChatThreadsPage({
        getPageRequest: (list) => {
          if (mode !== 'fetch-more') {
            return { lastCursor: null };
          }

          return list?.hasNextPage
            ? { lastCursor: list.endCursor ?? null }
            : undefined;
        },
        loadExtraThreads:
          mode === 'fetch-more' ? undefined : loadFavoriteThreadsOutsidePage,
        buildNextList: ({ list, page }) => {
          if (mode !== 'fetch-more') {
            return {
              threadIds: page.threads.map(({ id }) => id),
              hasNextPage: page.hasNextPage,
              endCursor: page.endCursor,
              filterStatusPages:
                mode === 'refresh-keeping-filter-status-pages'
                  ? list?.filterStatusPages
                  : undefined,
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
    [loadAgentChatThreadsPage, loadFavoriteThreadsOutsidePage],
  );

  return { loadAgentChatThreads };
};
