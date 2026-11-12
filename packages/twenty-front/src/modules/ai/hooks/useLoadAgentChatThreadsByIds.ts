import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAddAgentChatThreadParticipants } from '@/ai/hooks/useAddAgentChatThreadParticipants';
import { useAgentChatThreadLiveUpdates } from '@/ai/hooks/useAgentChatThreadLiveUpdates';
import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useFetchAgentChatThreadsPage } from '@/ai/hooks/useFetchAgentChatThreadsPage';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';

// Chats a server view lists may be past the loaded pages
export const useLoadAgentChatThreadsByIds = () => {
  const { refreshAgentChatThreadPermissions } =
    useRefreshAgentChatThreadPermissions();
  const { addAgentChatThread } = useApplyAgentChatThreadUpdate();
  const { fetchAgentChatThreadsPage } = useFetchAgentChatThreadsPage();
  const { addAgentChatThreadParticipants } =
    useAddAgentChatThreadParticipants();
  const { getLiveUpdateCount, applyLiveUpdatesSince } =
    useAgentChatThreadLiveUpdates();

  const loadAgentChatThreadsByIds = useCallback(
    async (threadIds: string[]) => {
      if (threadIds.length === 0) {
        return [];
      }

      const updateCountBeforeRequest = getLiveUpdateCount();
      const page = await fetchAgentChatThreadsPage({
        lastCursor: null,
        threadIdFilter: { id: { in: threadIds } },
      });

      if (!isDefined(page)) {
        return undefined;
      }

      await refreshAgentChatThreadPermissions(page.threads.map(({ id }) => id));

      for (const thread of applyLiveUpdatesSince({
        threads: page.threads,
        updateCount: updateCountBeforeRequest,
      })) {
        addAgentChatThread(thread);
      }
      addAgentChatThreadParticipants(page.participants);

      return page.threads;
    },
    [
      addAgentChatThread,
      addAgentChatThreadParticipants,
      fetchAgentChatThreadsPage,
      applyLiveUpdatesSince,
      getLiveUpdateCount,
      refreshAgentChatThreadPermissions,
    ],
  );

  return { loadAgentChatThreadsByIds };
};
