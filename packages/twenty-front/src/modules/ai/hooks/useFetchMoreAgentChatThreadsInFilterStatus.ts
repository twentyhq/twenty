import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type AgentChatThreadFilterStatus } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useLoadAgentChatThreadsInFilterStatus } from '@/ai/hooks/useLoadAgentChatThreadsInFilterStatus';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';

export const useFetchMoreAgentChatThreadsInFilterStatus = () => {
  const store = useStore();
  const { loadAgentChatThreadsInFilterStatus } =
    useLoadAgentChatThreadsInFilterStatus();

  const fetchMoreAgentChatThreadsInFilterStatus = useCallback(
    async (filterStatus: AgentChatThreadFilterStatus) => {
      let isPageAlreadyListed = true;

      while (isPageAlreadyListed) {
        const list = store.get(agentChatThreadListState.atom);
        const listedThreadIds = new Set([
          ...(list?.threadIds ?? []),
          ...(list?.filterStatusPages?.[filterStatus]?.threadIds ?? []),
        ]);
        const threads = await loadAgentChatThreadsInFilterStatus({
          filterStatus,
          mode: 'next',
        });

        if (!isDefined(threads)) {
          return;
        }

        isPageAlreadyListed = threads.every(({ id }) =>
          listedThreadIds.has(id),
        );
      }
    },
    [loadAgentChatThreadsInFilterStatus, store],
  );

  return { fetchMoreAgentChatThreadsInFilterStatus };
};
