import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined, isNonEmptyArray, isValidUuid } from 'twenty-shared/utils';

import { useAddAgentChatThreadParticipants } from '@/ai/hooks/useAddAgentChatThreadParticipants';
import { useAgentChatThreadLiveUpdates } from '@/ai/hooks/useAgentChatThreadLiveUpdates';
import { useFetchAgentChatThreadsPage } from '@/ai/hooks/useFetchAgentChatThreadsPage';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatFavoriteThreadsSelector } from '@/ai/states/selectors/agentChatFavoriteThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

export const useLoadAgentChatThreads = () => {
  const store = useStore();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { refreshAgentChatThreadPermissions } =
    useRefreshAgentChatThreadPermissions();
  const { fetchAgentChatThreadsPage } = useFetchAgentChatThreadsPage();
  const { addAgentChatThreadParticipants } =
    useAddAgentChatThreadParticipants();
  const { getLiveUpdateCount, isUpdatedLiveSince } =
    useAgentChatThreadLiveUpdates();

  const loadAgentChatThreads = useCallback(
    async (mode: 'refresh' | 'fetch-more') => {
      const workspaceId = store.get(currentWorkspaceState.atom)?.id;
      const userWorkspace = store.get(currentUserWorkspaceState.atom);
      const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;
      const isSameSession = () =>
        store.get(currentWorkspaceState.atom)?.id === workspaceId &&
        store.get(currentWorkspaceMemberState.atom)?.id === workspaceMemberId &&
        store.get(currentUserWorkspaceState.atom) === userWorkspace;

      const listBeforeRequest = store.get(agentChatThreadListState.atom);
      const updateCountBeforeRequest = getLiveUpdateCount();

      if (mode === 'fetch-more' && !listBeforeRequest?.hasNextPage) {
        return undefined;
      }

      const page = await fetchAgentChatThreadsPage({
        lastCursor:
          mode === 'fetch-more' ? (listBeforeRequest?.endCursor ?? null) : null,
      });

      if (!isDefined(page) || !isSameSession()) {
        return undefined;
      }

      const pageThreadIds = page.threads.map(({ id }) => id);
      const unloadedFavoriteThreadIds = store
        .get(agentChatFavoriteThreadsSelector.atom)
        .filter(
          ({ id, conversationType }) =>
            !isDefined(conversationType) && !pageThreadIds.includes(id),
        )
        .map(({ id }) => id);
      const favoriteThreads: AgentChatThreadRecord[] = [];
      const favoriteParticipants: AgentChatThreadParticipantFieldsFragment[] =
        [];

      if (mode === 'refresh' && isNonEmptyArray(unloadedFavoriteThreadIds)) {
        let favoriteCursor: string | null = null;

        do {
          const favoritePage = await fetchAgentChatThreadsPage({
            lastCursor: favoriteCursor,
            threadIdFilter: { id: { in: unloadedFavoriteThreadIds } },
          });

          if (!isDefined(favoritePage) || !isSameSession()) {
            return undefined;
          }

          favoriteThreads.push(...favoritePage.threads);
          favoriteParticipants.push(...favoritePage.participants);
          favoriteCursor = favoritePage.hasNextPage
            ? favoritePage.endCursor
            : null;
        } while (isDefined(favoriteCursor));
      }

      const selectedThreadId = store.get(currentAiChatThreadState.atom);
      await refreshAgentChatThreadPermissions([
        ...pageThreadIds,
        ...favoriteThreads.map(({ id }) => id),
        ...(isDefined(selectedThreadId) && isValidUuid(selectedThreadId)
          ? [selectedThreadId]
          : []),
      ]);

      const currentList = store.get(agentChatThreadListState.atom);

      if (
        !isSameSession() ||
        (mode === 'fetch-more' &&
          currentList?.endCursor !== listBeforeRequest?.endCursor)
      ) {
        return undefined;
      }

      upsertRecordsInStore({
        partialRecords: [...page.threads, ...favoriteThreads].filter(
          ({ id }) =>
            !isUpdatedLiveSince({
              threadId: id,
              updateCount: updateCountBeforeRequest,
            }),
        ),
      });
      addAgentChatThreadParticipants([
        ...page.participants,
        ...favoriteParticipants,
      ]);

      const currentThreadIds = currentList?.threadIds ?? [];
      const keptThreadIds =
        mode === 'fetch-more'
          ? currentThreadIds
          : currentThreadIds.filter(
              (threadId) =>
                !(listBeforeRequest?.threadIds ?? []).includes(threadId),
            );

      store.set(agentChatThreadListState.atom, {
        threadIds: [
          ...keptThreadIds,
          ...pageThreadIds.filter(
            (threadId) => !keptThreadIds.includes(threadId),
          ),
        ],
        hasNextPage: page.hasNextPage,
        endCursor: page.endCursor,
      });

      return page.threads;
    },
    [
      addAgentChatThreadParticipants,
      fetchAgentChatThreadsPage,
      getLiveUpdateCount,
      isUpdatedLiveSince,
      refreshAgentChatThreadPermissions,
      store,
      upsertRecordsInStore,
    ],
  );

  return { loadAgentChatThreads };
};
