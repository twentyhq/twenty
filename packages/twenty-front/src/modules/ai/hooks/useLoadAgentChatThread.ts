import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAddAgentChatThreadParticipants } from '@/ai/hooks/useAddAgentChatThreadParticipants';
import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useFetchAgentChatThreadsPage } from '@/ai/hooks/useFetchAgentChatThreadsPage';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { mergeLoadedAgentChatThread } from '@/ai/utils/mergeLoadedAgentChatThread';
import { getAgentChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';

export const useLoadAgentChatThread = () => {
  const store = useStore();
  const { refreshAgentChatThreadPermissions } =
    useRefreshAgentChatThreadPermissions();
  const { addLoadedAgentChatThread } = useApplyAgentChatThreadUpdate();
  const { fetchAgentChatThreadsPage } = useFetchAgentChatThreadsPage();
  const { addAgentChatThreadParticipants } =
    useAddAgentChatThreadParticipants();

  // A chat opened by URL may be past the loaded pages; null if not listed for this member, undefined if unknown.
  const loadAgentChatThread = useCallback(
    async (threadId: string) => {
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

      const loadedThread = mergeLoadedAgentChatThread({
        loadedThread: thread,
        storedThread: store.get(
          agentChatThreadRecordFamilySelector.selectorFamily(thread.id),
        ),
      });

      addLoadedAgentChatThread(loadedThread);
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
      addLoadedAgentChatThread,
      addAgentChatThreadParticipants,
      fetchAgentChatThreadsPage,
      refreshAgentChatThreadPermissions,
      store,
    ],
  );

  return { loadAgentChatThread };
};
