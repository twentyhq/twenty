import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAddAgentChatThreadParticipants } from '@/ai/hooks/useAddAgentChatThreadParticipants';
import { useAgentChatThreadLiveUpdates } from '@/ai/hooks/useAgentChatThreadLiveUpdates';
import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useFetchAgentChatThreadsPage } from '@/ai/hooks/useFetchAgentChatThreadsPage';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { getAgentChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';

export const useLoadAgentChatThread = () => {
  const store = useStore();
  const { refreshAgentChatThreadPermissions } =
    useRefreshAgentChatThreadPermissions();
  const { addAgentChatThread } = useApplyAgentChatThreadUpdate();
  const { fetchAgentChatThreadsPage } = useFetchAgentChatThreadsPage();
  const { addAgentChatThreadParticipants } =
    useAddAgentChatThreadParticipants();
  const { getLiveUpdateCount, applyLiveUpdatesSince } =
    useAgentChatThreadLiveUpdates();

  // A chat opened by URL may be past the loaded pages; null if not listed for this member, undefined if unknown.
  const loadAgentChatThread = useCallback(
    async (threadId: string) => {
      const updateCountBeforeRequest = getLiveUpdateCount();
      const page = await fetchAgentChatThreadsPage({
        lastCursor: null,
        threadIdFilter: { id: { eq: threadId } },
      });

      if (!isDefined(page)) {
        return undefined;
      }

      const thread = page.threads[0];

      if (!isDefined(thread)) {
        return null;
      }

      await refreshAgentChatThreadPermissions([thread.id]);

      const [loadedThread] = applyLiveUpdatesSince({
        threads: [thread],
        updateCount: updateCountBeforeRequest,
      });

      addAgentChatThread(loadedThread);
      addAgentChatThreadParticipants(page.participants);

      const usageAtom = agentChatUsageFamilyState.atomFamily({
        threadId: thread.id,
      });

      if (!isDefined(store.get(usageAtom))) {
        store.set(usageAtom, getAgentChatUsageFromThread(loadedThread));
      }

      return loadedThread;
    },
    [
      addAgentChatThread,
      addAgentChatThreadParticipants,
      fetchAgentChatThreadsPage,
      applyLiveUpdatesSince,
      getLiveUpdateCount,
      refreshAgentChatThreadPermissions,
      store,
    ],
  );

  return { loadAgentChatThread };
};
