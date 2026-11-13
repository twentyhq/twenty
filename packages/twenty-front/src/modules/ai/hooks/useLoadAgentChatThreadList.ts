import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { computeAgentChatThreadPresetFilterGqlFilter } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray, isValidUuid } from 'twenty-shared/utils';

import { AGENT_CHAT_CHANNEL_THREAD_LIST_PAGE_SIZE } from '@/ai/constants/AgentChatChannelThreadListPageSize';
import { AGENT_CHAT_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { useAddAgentChatThreadParticipants } from '@/ai/hooks/useAddAgentChatThreadParticipants';
import { useCaptureAgentChatSession } from '@/ai/hooks/useCaptureAgentChatSession';
import { useFetchAgentChatThreadsPage } from '@/ai/hooks/useFetchAgentChatThreadsPage';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { agentChatThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { agentChatThreadListLoadCountFamilyState } from '@/ai/states/agentChatThreadListLoadCountFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatFavoriteThreadsSelector } from '@/ai/states/selectors/agentChatFavoriteThreadsSelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AgentChatThreadListSource } from '@/ai/types/AgentChatThreadListSource';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { mergeLoadedAgentChatThread } from '@/ai/utils/mergeLoadedAgentChatThread';
import { mergeAgentChatThreadListIds } from '@/ai/utils/mergeAgentChatThreadListIds';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import {
  type AgentChatThreadParticipantFieldsFragment,
  GetAgentChatChannelThreadIdsDocument,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

type AgentChatThreadRecordsPage = {
  threads: AgentChatThreadRecord[];
  participants: AgentChatThreadParticipantFieldsFragment[];
};

type AgentChatThreadListPage = AgentChatThreadRecordsPage & {
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
};

export const useLoadAgentChatThreadList = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { fetchAgentChatThreadsPage } = useFetchAgentChatThreadsPage();
  const { refreshAgentChatThreadPermissions } =
    useRefreshAgentChatThreadPermissions();
  const { addAgentChatThreadParticipants } =
    useAddAgentChatThreadParticipants();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { captureAgentChatSession } = useCaptureAgentChatSession();

  const fetchThreadsByIds = useCallback(
    async (
      threadIds: string[],
    ): Promise<AgentChatThreadRecordsPage | undefined> => {
      const threads: AgentChatThreadRecord[] = [];
      const participants: AgentChatThreadParticipantFieldsFragment[] = [];

      if (!isNonEmptyArray(threadIds)) {
        return { threads, participants };
      }

      let lastCursor: string | null = null;

      do {
        const page = await fetchAgentChatThreadsPage({
          lastCursor,
          threadIdFilter: { id: { in: threadIds } },
        });

        if (!isDefined(page)) {
          return undefined;
        }

        threads.push(...page.threads);
        participants.push(...page.participants);
        lastCursor = page.hasNextPage ? page.endCursor : null;
      } while (isDefined(lastCursor));

      return { threads, participants };
    },
    [fetchAgentChatThreadsPage],
  );

  const fetchListPage = useCallback(
    async ({
      source,
      lastCursor,
      workspaceMemberId,
    }: {
      source: AgentChatThreadListSource;
      lastCursor: string | null;
      workspaceMemberId: string | undefined;
    }): Promise<AgentChatThreadListPage | undefined> => {
      if (source.type === 'channel') {
        const { channelView } = source;
        const idsPage = (
          await apolloClient
            .query({
              query: GetAgentChatChannelThreadIdsDocument,
              variables: {
                channelId: channelView.channelId,
                status: channelView.channelStatus,
                assignment: channelView.assignment,
                filter: channelView.filter,
                first: AGENT_CHAT_CHANNEL_THREAD_LIST_PAGE_SIZE,
                after: lastCursor,
              },
              fetchPolicy: 'network-only',
            })
            .catch((error) => {
              logError(error);

              return undefined;
            })
        )?.data?.agentChatChannelThreadIds;

        if (!isDefined(idsPage)) {
          return undefined;
        }

        const recentThreadIds = new Set(
          store.get(
            agentChatThreadListFamilyState.atomFamily(
              getAgentChatThreadListSourceKey(
                AGENT_CHAT_RECENT_THREAD_LIST_SOURCE,
              ),
            ),
          )?.threadIds ?? [],
        );
        const recordsPage = await fetchThreadsByIds(
          idsPage.threadIds.filter(
            (threadId) => !recentThreadIds.has(threadId),
          ),
        );

        if (!isDefined(recordsPage)) {
          return undefined;
        }

        return {
          ...recordsPage,
          threadIds: idsPage.threadIds,
          hasNextPage: idsPage.hasNextPage,
          endCursor: idsPage.endCursor ?? null,
        };
      }

      const page = await fetchAgentChatThreadsPage({
        lastCursor,
        threadIdFilter:
          source.type === 'presetFilter' && isDefined(workspaceMemberId)
            ? {
                and: [
                  { deletedAt: { is: 'NULL' } },
                  computeAgentChatThreadPresetFilterGqlFilter({
                    presetFilter: source.presetFilter,
                    workspaceMemberId,
                  }),
                ],
              }
            : undefined,
      });

      if (!isDefined(page)) {
        return undefined;
      }

      return { ...page, threadIds: page.threads.map(({ id }) => id) };
    },
    [apolloClient, fetchAgentChatThreadsPage, fetchThreadsByIds, store],
  );

  const loadAgentChatThreadList = useCallback(
    async ({
      source,
      mode,
    }: {
      source: AgentChatThreadListSource;
      mode: 'refresh' | 'fetch-more';
    }): Promise<AgentChatThreadRecord[] | undefined> => {
      const sourceKey = getAgentChatThreadListSourceKey(source);
      const listAtom = agentChatThreadListFamilyState.atomFamily(sourceKey);
      const loadCountAtom =
        agentChatThreadListLoadCountFamilyState.atomFamily(sourceKey);
      const listBeforeRequest = store.get(listAtom);
      const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;
      const isFetchMore = mode === 'fetch-more';

      if (
        (source.type === 'presetFilter' && !isDefined(workspaceMemberId)) ||
        (isFetchMore && !listBeforeRequest?.hasNextPage)
      ) {
        return undefined;
      }

      const { isSameSession } = captureAgentChatSession();
      const loadCount = store.get(loadCountAtom) + (isFetchMore ? 0 : 1);

      store.set(loadCountAtom, loadCount);

      const page = await fetchListPage({
        source,
        lastCursor: isFetchMore ? (listBeforeRequest?.endCursor ?? null) : null,
        workspaceMemberId,
      });

      if (!isDefined(page) || !isSameSession()) {
        return undefined;
      }

      const unlistedFavoritesPage =
        source.type === 'recent' && !isFetchMore
          ? await fetchThreadsByIds(
              store
                .get(agentChatFavoriteThreadsSelector.atom)
                .filter(
                  ({ id, conversationType }) =>
                    !isDefined(conversationType) &&
                    !page.threadIds.includes(id),
                )
                .map(({ id }) => id),
            )
          : { threads: [], participants: [] };

      if (!isDefined(unlistedFavoritesPage) || !isSameSession()) {
        return undefined;
      }

      const selectedThreadId = store.get(currentAiChatThreadState.atom);

      await refreshAgentChatThreadPermissions([
        ...page.threadIds,
        ...unlistedFavoritesPage.threads.map(({ id }) => id),
        ...(isDefined(selectedThreadId) && isValidUuid(selectedThreadId)
          ? [selectedThreadId]
          : []),
      ]);

      const currentList = store.get(listAtom);

      if (
        !isSameSession() ||
        store.get(loadCountAtom) !== loadCount ||
        (isFetchMore && currentList?.endCursor !== listBeforeRequest?.endCursor)
      ) {
        return undefined;
      }

      upsertRecordsInStore({
        partialRecords: [...page.threads, ...unlistedFavoritesPage.threads].map(
          (loadedThread) =>
            mergeLoadedAgentChatThread({
              loadedThread,
              storedThread: store.get(
                agentChatThreadRecordFamilySelector.selectorFamily(
                  loadedThread.id,
                ),
              ),
            }),
        ),
      });
      addAgentChatThreadParticipants([
        ...page.participants,
        ...unlistedFavoritesPage.participants,
      ]);

      const lastPageThreadId = page.threadIds.at(-1);
      const lastPageThread = isDefined(lastPageThreadId)
        ? (page.threads.find(({ id }) => id === lastPageThreadId) ??
          store.get(
            agentChatThreadRecordFamilySelector.selectorFamily(
              lastPageThreadId,
            ),
          ))
        : undefined;

      store.set(listAtom, {
        threadIds: mergeAgentChatThreadListIds({
          mode,
          threadIdsBeforeRequest: listBeforeRequest?.threadIds ?? [],
          currentThreadIds: currentList?.threadIds ?? [],
          pageThreadIds: page.threadIds,
        }),
        hasNextPage: page.hasNextPage,
        endCursor: page.endCursor,
        lastLoadedActivityAt: isDefined(lastPageThreadId)
          ? (lastPageThread?.lastActivityAt ?? null)
          : (listBeforeRequest?.lastLoadedActivityAt ?? null),
      });

      return page.threads;
    },
    [
      addAgentChatThreadParticipants,
      captureAgentChatSession,
      fetchListPage,
      fetchThreadsByIds,
      refreshAgentChatThreadPermissions,
      store,
      upsertRecordsInStore,
    ],
  );

  return { loadAgentChatThreadList };
};
