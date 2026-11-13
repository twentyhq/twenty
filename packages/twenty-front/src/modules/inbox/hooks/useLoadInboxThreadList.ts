import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { computeAgentChatThreadPresetFilterGqlFilter } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray, isValidUuid } from 'twenty-shared/utils';

import { INBOX_CHANNEL_THREAD_LIST_PAGE_SIZE } from '@/inbox/constants/InboxChannelThreadListPageSize';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useAddAiChatThreadParticipants } from '@/ai/hooks/useAddAiChatThreadParticipants';
import { useCaptureAiChatSession } from '@/ai/hooks/useCaptureAiChatSession';
import { useFetchAiChatThreadsPage } from '@/ai/hooks/useFetchAiChatThreadsPage';
import { useRefreshAiChatThreadPermissions } from '@/ai/hooks/useRefreshAiChatThreadPermissions';
import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';
import { inboxThreadListLoadCountFamilyState } from '@/inbox/states/inboxThreadListLoadCountFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { type InboxThreadListSource } from '@/inbox/types/InboxThreadListSource';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { getInboxThreadListSourceKey } from '@/inbox/utils/getInboxThreadListSourceKey';
import { mergeLoadedAiChatThread } from '@/ai/utils/mergeLoadedAiChatThread';
import { mergeInboxThreadListIds } from '@/inbox/utils/mergeInboxThreadListIds';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import {
  type AgentChatThreadParticipantFieldsFragment,
  GetAgentChatChannelThreadIdsDocument,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

type AiChatThreadRecordsPage = {
  threads: AiChatThreadRecord[];
  participants: AgentChatThreadParticipantFieldsFragment[];
};

type InboxThreadListPage = AiChatThreadRecordsPage & {
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
};

export const useLoadInboxThreadList = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { fetchAiChatThreadsPage } = useFetchAiChatThreadsPage();
  const { refreshAiChatThreadPermissions } =
    useRefreshAiChatThreadPermissions();
  const { addAiChatThreadParticipants } = useAddAiChatThreadParticipants();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { captureAiChatSession } = useCaptureAiChatSession();

  const fetchThreadsByIds = useCallback(
    async (
      threadIds: string[],
    ): Promise<AiChatThreadRecordsPage | undefined> => {
      const threads: AiChatThreadRecord[] = [];
      const participants: AgentChatThreadParticipantFieldsFragment[] = [];

      if (!isNonEmptyArray(threadIds)) {
        return { threads, participants };
      }

      let lastCursor: string | null = null;

      do {
        const page = await fetchAiChatThreadsPage({
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
    [fetchAiChatThreadsPage],
  );

  const fetchListPage = useCallback(
    async ({
      source,
      lastCursor,
      workspaceMemberId,
    }: {
      source: InboxThreadListSource;
      lastCursor: string | null;
      workspaceMemberId: string | undefined;
    }): Promise<InboxThreadListPage | undefined> => {
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
                first: INBOX_CHANNEL_THREAD_LIST_PAGE_SIZE,
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
            inboxThreadListFamilyState.atomFamily(
              getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
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

      const page = await fetchAiChatThreadsPage({
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
    [apolloClient, fetchAiChatThreadsPage, fetchThreadsByIds, store],
  );

  const loadInboxThreadList = useCallback(
    async ({
      source,
      mode,
    }: {
      source: InboxThreadListSource;
      mode: 'refresh' | 'fetch-more';
    }): Promise<AiChatThreadRecord[] | undefined> => {
      const sourceKey = getInboxThreadListSourceKey(source);
      const listAtom = inboxThreadListFamilyState.atomFamily(sourceKey);
      const loadCountAtom =
        inboxThreadListLoadCountFamilyState.atomFamily(sourceKey);
      const listBeforeRequest = store.get(listAtom);
      const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;
      const isFetchMore = mode === 'fetch-more';

      if (
        (source.type === 'presetFilter' && !isDefined(workspaceMemberId)) ||
        (isFetchMore && !listBeforeRequest?.hasNextPage)
      ) {
        return undefined;
      }

      const { isSameSession } = captureAiChatSession();
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
                .get(inboxFavoriteThreadsSelector.atom)
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

      await refreshAiChatThreadPermissions([
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
            mergeLoadedAiChatThread({
              loadedThread,
              storedThread: store.get(
                aiChatThreadRecordFamilySelector.selectorFamily(
                  loadedThread.id,
                ),
              ),
            }),
        ),
      });
      addAiChatThreadParticipants([
        ...page.participants,
        ...unlistedFavoritesPage.participants,
      ]);

      const lastPageThreadId = page.threadIds.at(-1);
      const lastPageThread = isDefined(lastPageThreadId)
        ? (page.threads.find(({ id }) => id === lastPageThreadId) ??
          store.get(
            aiChatThreadRecordFamilySelector.selectorFamily(lastPageThreadId),
          ))
        : undefined;

      store.set(listAtom, {
        threadIds: mergeInboxThreadListIds({
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
      addAiChatThreadParticipants,
      captureAiChatSession,
      fetchListPage,
      fetchThreadsByIds,
      refreshAiChatThreadPermissions,
      store,
      upsertRecordsInStore,
    ],
  );

  return { loadInboxThreadList };
};
