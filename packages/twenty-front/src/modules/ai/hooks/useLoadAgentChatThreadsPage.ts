import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { useAddAgentChatThreadParticipants } from '@/ai/hooks/useAddAgentChatThreadParticipants';
import { useFetchAgentChatThreadsPage } from '@/ai/hooks/useFetchAgentChatThreadsPage';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import {
  type AgentChatThreadList,
  agentChatThreadListState,
} from '@/ai/states/agentChatThreadListState';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type AgentChatThreadsPage } from '@/ai/types/AgentChatThreadsPage';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';

type AgentChatThreadsPageRequest = {
  lastCursor: string | null;
  filter?: RecordGqlOperationFilter;
};

type ExtraAgentChatThreads = Pick<
  AgentChatThreadsPage,
  'threads' | 'participants'
>;

export const useLoadAgentChatThreadsPage = () => {
  const store = useStore();
  const { fetchAgentChatThreadsPage } = useFetchAgentChatThreadsPage();
  const { addAgentChatThreadParticipants } =
    useAddAgentChatThreadParticipants();
  const { refreshAgentChatThreadPermissions } =
    useRefreshAgentChatThreadPermissions();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const loadAgentChatThreadsPage = useCallback(
    async ({
      getPageRequest,
      loadExtraThreads,
      buildNextList,
    }: {
      getPageRequest: (
        list: AgentChatThreadList | null,
      ) => AgentChatThreadsPageRequest | undefined;
      loadExtraThreads?: (
        page: AgentChatThreadsPage,
      ) => Promise<ExtraAgentChatThreads | undefined>;
      buildNextList: ({
        list,
        page,
      }: {
        list: AgentChatThreadList | null;
        page: AgentChatThreadsPage;
      }) => AgentChatThreadList;
    }) => {
      const workspaceId = store.get(currentWorkspaceState.atom)?.id;
      const userWorkspace = store.get(currentUserWorkspaceState.atom);
      const workspaceMemberId = store.get(currentWorkspaceMemberState.atom)?.id;
      const isSameSession = () =>
        store.get(currentWorkspaceState.atom)?.id === workspaceId &&
        store.get(currentWorkspaceMemberState.atom)?.id === workspaceMemberId &&
        store.get(currentUserWorkspaceState.atom) === userWorkspace;

      for (let attempt = 0; attempt < 2; attempt++) {
        const listBeforeRequest = store.get(agentChatThreadListState.atom);
        const updateCountBeforeRequest = store.get(
          agentChatThreadRecordUpdateCountState.atom,
        );
        const hasChangedSinceRequest = () =>
          store.get(agentChatThreadListState.atom) !== listBeforeRequest ||
          store.get(agentChatThreadRecordUpdateCountState.atom) !==
            updateCountBeforeRequest;

        const pageRequest = getPageRequest(listBeforeRequest);

        if (!isDefined(pageRequest)) {
          return undefined;
        }

        const page = await fetchAgentChatThreadsPage(pageRequest);

        if (!isDefined(page) || !isSameSession()) {
          return undefined;
        }

        const extraThreads = isDefined(loadExtraThreads)
          ? await loadExtraThreads(page)
          : { threads: [], participants: [] };

        if (!isDefined(extraThreads) || !isSameSession()) {
          return undefined;
        }

        // Retry rather than overwrite a record event applied mid-request.
        if (hasChangedSinceRequest()) {
          continue;
        }

        const selectedThreadId = store.get(currentAiChatThreadState.atom);
        await refreshAgentChatThreadPermissions([
          ...page.threads.map(({ id }) => id),
          ...extraThreads.threads.map(({ id }) => id),
          ...(isDefined(selectedThreadId) && isValidUuid(selectedThreadId)
            ? [selectedThreadId]
            : []),
        ]);

        if (!isSameSession() || hasChangedSinceRequest()) {
          continue;
        }

        upsertRecordsInStore({
          partialRecords: [...page.threads, ...extraThreads.threads],
        });
        addAgentChatThreadParticipants([
          ...page.participants,
          ...extraThreads.participants,
        ]);

        store.set(
          agentChatThreadListState.atom,
          buildNextList({ list: listBeforeRequest, page }),
        );

        return page.threads;
      }

      return undefined;
    },
    [
      addAgentChatThreadParticipants,
      fetchAgentChatThreadsPage,
      refreshAgentChatThreadPermissions,
      store,
      upsertRecordsInStore,
    ],
  );

  return { loadAgentChatThreadsPage };
};
