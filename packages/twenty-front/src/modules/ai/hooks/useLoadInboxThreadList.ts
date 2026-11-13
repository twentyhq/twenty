import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { computeAgentChatThreadPresetFilterGqlFilter } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray, isValidUuid } from 'twenty-shared/utils';

import { INBOX_CHANNEL_THREAD_LIST_PAGE_SIZE } from '@/ai/constants/InboxChannelThreadListPageSize';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/InboxRecentThreadListSource';
import { useAddInboxThreadParticipants } from '@/ai/hooks/useAddInboxThreadParticipants';
import { useCaptureInboxSession } from '@/ai/hooks/useCaptureInboxSession';
import { useFetchInboxThreadsPage } from '@/ai/hooks/useFetchInboxThreadsPage';
import { useRefreshInboxThreadPermissions } from '@/ai/hooks/useRefreshInboxThreadPermissions';
import { inboxThreadListFamilyState } from '@/ai/states/inboxThreadListFamilyState';
import { inboxThreadListLoadCountFamilyState } from '@/ai/states/inboxThreadListLoadCountFamilyState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { inboxFavoriteThreadsSelector } from '@/ai/states/selectors/inboxFavoriteThreadsSelector';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/inboxThreadRecordFamilySelector';
import { type InboxThreadListSource } from '@/ai/types/InboxThreadListSource';
import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';
import { getInboxThreadListSourceKey } from '@/ai/utils/getInboxThreadListSourceKey';
import { mergeLoadedInboxThread } from '@/ai/utils/mergeLoadedInboxThread';
import { mergeInboxThreadListIds } from '@/ai/utils/mergeInboxThreadListIds';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import {
  type AgentChatThreadParticipantFieldsFragment,
  GetAgentChatChannelThreadIdsDocument,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

type InboxThreadRecordsPage = {
  threads: InboxThreadRecord[];
  participants: AgentChatThreadParticipantFieldsFragment[];
};

type InboxThreadListPage = InboxThreadRecordsPage & {
  threadIds: string[];
  hasNextPage: boolean;
  endCursor: string | null;
};

export const useLoadInboxThreadList = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { fetchInboxThreadsPage } = useFetchInboxThreadsPage();
  const { refreshInboxThreadPermissions } = useRefreshInboxThreadPermissions();
  const { addInboxThreadParticipants } = useAddInboxThreadParticipants();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();
  const { captureInboxSession } = useCaptureInboxSession();

  const fetchThreadsByIds = useCallback(
    async (
      threadIds: string[],
    ): Promise<InboxThreadRecordsPage | undefined> => {
      const threads: InboxThreadRecord[] = [];
      const participants: AgentChatThreadParticipantFieldsFragment[] = [];

      if (!isNonEmptyArray(threadIds)) {
        return { threads, participants };
      }

      let lastCursor: string | null = null;

      do {
        const page = await fetchInboxThreadsPage({
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
    [fetchInboxThreadsPage],
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

      const page = await fetchInboxThreadsPage({
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
    [apolloClient, fetchInboxThreadsPage, fetchThreadsByIds, store],
  );

  const loadInboxThreadList = useCallback(
    async ({
      source,
      mode,
    }: {
      source: InboxThreadListSource;
      mode: 'refresh' | 'fetch-more';
    }): Promise<InboxThreadRecord[] | undefined> => {
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

      const { isSameSession } = captureInboxSession();
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

      const selectedThreadId = store.get(currentInboxThreadState.atom);

      await refreshInboxThreadPermissions([
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
            mergeLoadedInboxThread({
              loadedThread,
              storedThread: store.get(
                inboxThreadRecordFamilySelector.selectorFamily(loadedThread.id),
              ),
            }),
        ),
      });
      addInboxThreadParticipants([
        ...page.participants,
        ...unlistedFavoritesPage.participants,
      ]);

      const lastPageThreadId = page.threadIds.at(-1);
      const lastPageThread = isDefined(lastPageThreadId)
        ? (page.threads.find(({ id }) => id === lastPageThreadId) ??
          store.get(
            inboxThreadRecordFamilySelector.selectorFamily(lastPageThreadId),
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
      addInboxThreadParticipants,
      captureInboxSession,
      fetchListPage,
      fetchThreadsByIds,
      refreshInboxThreadPermissions,
      store,
      upsertRecordsInStore,
    ],
  );

  return { loadInboxThreadList };
};
