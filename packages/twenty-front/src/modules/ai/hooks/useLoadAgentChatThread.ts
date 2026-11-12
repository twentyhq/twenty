import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAddAgentChatThreadParticipants } from '@/ai/hooks/useAddAgentChatThreadParticipants';
import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useFetchAgentChatThreadsPage } from '@/ai/hooks/useFetchAgentChatThreadsPage';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { agentChatThreadRecordUpdateCountState } from '@/ai/states/agentChatThreadRecordUpdateCountState';
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

  // A chat opened by URL may be past the loaded pages; null if not listed for this member, undefined if unknown.
  const loadAgentChatThread = useCallback(
    async (threadId: string) => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const updateCountBeforeRequest = store.get(
          agentChatThreadRecordUpdateCountState.atom,
        );
        const page = await fetchAgentChatThreadsPage({
          lastCursor: null,
          filter: { id: { eq: threadId } },
        });

        if (!isDefined(page)) {
          return undefined;
        }

        const thread = page.threads[0];

        if (!isDefined(thread)) {
          return null;
        }

        await refreshAgentChatThreadPermissions([thread.id]);

        if (
          store.get(agentChatThreadRecordUpdateCountState.atom) !==
          updateCountBeforeRequest
        ) {
          continue;
        }

        addAgentChatThread(thread);
        addAgentChatThreadParticipants(page.participants);

        // The chat may have been selected before its record loaded, when usage couldn't be restored.
        const usageAtom = agentChatUsageFamilyState.atomFamily({
          threadId: thread.id,
        });

        if (!isDefined(store.get(usageAtom))) {
          store.set(usageAtom, getAgentChatUsageFromThread(thread));
        }

        return thread;
      }

      return undefined;
    },
    [
      addAgentChatThread,
      addAgentChatThreadParticipants,
      fetchAgentChatThreadsPage,
      refreshAgentChatThreadPermissions,
      store,
    ],
  );

  return { loadAgentChatThread };
};
