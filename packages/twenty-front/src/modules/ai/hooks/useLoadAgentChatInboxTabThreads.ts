import { useStore } from 'jotai';
import { useCallback } from 'react';
import { computeAgentChatThreadFilterStatusGqlFilter } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useAddAgentChatThreadParticipants } from '@/ai/hooks/useAddAgentChatThreadParticipants';
import { useFetchAgentChatThreadsPage } from '@/ai/hooks/useFetchAgentChatThreadsPage';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { agentChatInboxTabThreadListState } from '@/ai/states/agentChatInboxTabThreadListState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadLastUpdateCountByIdState } from '@/ai/states/agentChatThreadLastUpdateCountByIdState';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';

export const useLoadAgentChatInboxTabThreads = () => {
  const store = useStore();
  const { fetchAgentChatThreadsPage } = useFetchAgentChatThreadsPage();
  const { refreshAgentChatThreadPermissions } =
    useRefreshAgentChatThreadPermissions();
  const { addAgentChatThreadParticipants } =
    useAddAgentChatThreadParticipants();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const loadAgentChatInboxTabThreads = useCallback(
    async (mode: 'refresh' | 'fetch-more') => {
      const filterStatus = store.get(agentChatThreadFilterStatusState.atom);
      const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;
      const isShownTab = () =>
        !isDefined(store.get(agentChatShownChannelViewSelector.atom)) &&
        store.get(agentChatThreadFilterStatusState.atom) === filterStatus;

      if (!isShownTab() || !isDefined(workspaceMemberId)) {
        return;
      }

      const listBeforeRequest = store.get(
        agentChatInboxTabThreadListState.atom,
      );
      const isFetchMore = mode === 'fetch-more';

      if (
        isFetchMore &&
        (listBeforeRequest?.filterStatus !== filterStatus ||
          !listBeforeRequest.hasNextPage)
      ) {
        return;
      }

      const updateCountBeforeRequest = store.get(
        agentChatThreadRecordUpdateCountState.atom,
      );
      const page = await fetchAgentChatThreadsPage({
        lastCursor: isFetchMore ? (listBeforeRequest?.endCursor ?? null) : null,
        threadIdFilter: {
          and: [
            { deletedAt: { is: 'NULL' } },
            computeAgentChatThreadFilterStatusGqlFilter({
              filterStatus,
              workspaceMemberId,
            }),
          ],
        },
      });

      if (!isDefined(page)) {
        return;
      }

      await refreshAgentChatThreadPermissions(page.threads.map(({ id }) => id));

      if (
        !isShownTab() ||
        (isFetchMore &&
          store.get(agentChatInboxTabThreadListState.atom) !==
            listBeforeRequest)
      ) {
        return;
      }

      const lastUpdateCountById = store.get(
        agentChatThreadLastUpdateCountByIdState.atom,
      );

      upsertRecordsInStore({
        partialRecords: page.threads.filter(
          ({ id }) =>
            (lastUpdateCountById[id] ?? 0) <= updateCountBeforeRequest,
        ),
      });
      addAgentChatThreadParticipants(page.participants);

      const previousThreadIds = isFetchMore
        ? (listBeforeRequest?.threadIds ?? [])
        : [];
      const lastPageThread = page.threads.at(-1);

      store.set(agentChatInboxTabThreadListState.atom, {
        filterStatus,
        threadIds: [
          ...previousThreadIds,
          ...page.threads
            .map(({ id }) => id)
            .filter((threadId) => !previousThreadIds.includes(threadId)),
        ],
        hasNextPage: page.hasNextPage,
        endCursor: page.endCursor,
        lastLoadedActivityAt: isDefined(lastPageThread)
          ? (lastPageThread.lastActivityAt ?? null)
          : (listBeforeRequest?.lastLoadedActivityAt ?? null),
      });
    },
    [
      addAgentChatThreadParticipants,
      fetchAgentChatThreadsPage,
      refreshAgentChatThreadPermissions,
      store,
      upsertRecordsInStore,
    ],
  );

  return { loadAgentChatInboxTabThreads };
};
