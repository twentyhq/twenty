import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAddAiChatThreadParticipants } from '@/ai/hooks/useAddAgentChatThreadParticipants';
import { useApplyAiChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useFetchAiChatThreadsPage } from '@/ai/hooks/useFetchAgentChatThreadsPage';
import { useRefreshAiChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { aiChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { mergeLoadedAiChatThread } from '@/ai/utils/mergeLoadedAgentChatThread';
import { getAiChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';

export const useLoadAiChatThread = () => {
  const store = useStore();
  const { refreshAiChatThreadPermissions } =
    useRefreshAiChatThreadPermissions();
  const { addLoadedAiChatThread } = useApplyAiChatThreadUpdate();
  const { fetchAiChatThreadsPage } = useFetchAiChatThreadsPage();
  const { addAiChatThreadParticipants } = useAddAiChatThreadParticipants();

  // A chat opened by URL may be past the loaded pages; null if not listed for this member, undefined if unknown.
  const loadAiChatThread = useCallback(
    async (threadId: string) => {
      const page = await fetchAiChatThreadsPage({
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

      await refreshAiChatThreadPermissions([thread.id]);

      const loadedThread = mergeLoadedAiChatThread({
        loadedThread: thread,
        storedThread: store.get(
          aiChatThreadRecordFamilySelector.selectorFamily(thread.id),
        ),
      });

      addLoadedAiChatThread(loadedThread);
      addAiChatThreadParticipants(page.participants);

      const usageAtom = aiChatUsageFamilyState.atomFamily({
        threadId: thread.id,
      });

      if (!isDefined(store.get(usageAtom))) {
        store.set(usageAtom, getAiChatUsageFromThread(loadedThread));
      }

      return loadedThread;
    },
    [
      addLoadedAiChatThread,
      addAiChatThreadParticipants,
      fetchAiChatThreadsPage,
      refreshAiChatThreadPermissions,
      store,
    ],
  );

  return { loadAiChatThread };
};
