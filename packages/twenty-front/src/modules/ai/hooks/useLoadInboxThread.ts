import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAddInboxThreadParticipants } from '@/ai/hooks/useAddInboxThreadParticipants';
import { useApplyInboxThreadUpdate } from '@/ai/hooks/useApplyInboxThreadUpdate';
import { useFetchInboxThreadsPage } from '@/ai/hooks/useFetchInboxThreadsPage';
import { useRefreshInboxThreadPermissions } from '@/ai/hooks/useRefreshInboxThreadPermissions';
import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/inboxThreadRecordFamilySelector';
import { mergeLoadedInboxThread } from '@/ai/utils/mergeLoadedInboxThread';
import { getAgentChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';

export const useLoadInboxThread = () => {
  const store = useStore();
  const { refreshInboxThreadPermissions } = useRefreshInboxThreadPermissions();
  const { addLoadedInboxThread } = useApplyInboxThreadUpdate();
  const { fetchInboxThreadsPage } = useFetchInboxThreadsPage();
  const { addInboxThreadParticipants } = useAddInboxThreadParticipants();

  // A chat opened by URL may be past the loaded pages; null if not listed for this member, undefined if unknown.
  const loadInboxThread = useCallback(
    async (threadId: string) => {
      const page = await fetchInboxThreadsPage({
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

      await refreshInboxThreadPermissions([thread.id]);

      const loadedThread = mergeLoadedInboxThread({
        loadedThread: thread,
        storedThread: store.get(
          inboxThreadRecordFamilySelector.selectorFamily(thread.id),
        ),
      });

      addLoadedInboxThread(loadedThread);
      addInboxThreadParticipants(page.participants);

      const usageAtom = agentChatUsageFamilyState.atomFamily({
        threadId: thread.id,
      });

      if (!isDefined(store.get(usageAtom))) {
        store.set(usageAtom, getAgentChatUsageFromThread(loadedThread));
      }

      return loadedThread;
    },
    [
      addLoadedInboxThread,
      addInboxThreadParticipants,
      fetchInboxThreadsPage,
      refreshInboxThreadPermissions,
      store,
    ],
  );

  return { loadInboxThread };
};
