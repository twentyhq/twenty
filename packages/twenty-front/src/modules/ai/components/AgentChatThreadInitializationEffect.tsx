import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { getAgentChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { agentChatThreadsLoadingSelector } from '@/ai/states/selectors/agentChatThreadsLoadingSelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { hasInitializedAgentChatThreadsState } from '@/ai/states/hasInitializedAgentChatThreadsState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const AGENT_CHAT_THREADS_REFRESH_RETRY_DELAY_MS = 3000;

export const AgentChatThreadInitializationEffect = () => {
  const { refreshAgentChatThreads } = useRefreshAgentChatThreads();
  // The record API builds chat queries from the chat object's fields.
  const areFieldMetadataItemsLoaded =
    useAtomFamilySelectorValue(
      metadataStoreStatusFamilySelector,
      'fieldMetadataItems',
    ) === 'up-to-date';

  const agentChatThreadsLoading = useAtomStateValue(
    agentChatThreadsLoadingSelector,
  );

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const setCurrentAiChatThread = useSetAtomState(currentAiChatThreadState);
  const store = useStore();
  const agentChatVisibleThreads = useAtomStateValue(
    agentChatVisibleThreadsSelector,
  );
  const [hasInitializedAgentChatThreads, setHasInitializedAgentChatThreads] =
    useAtomState(hasInitializedAgentChatThreadsState);

  useEffect(() => {
    if (!agentChatThreadsLoading || !areFieldMetadataItemsLoaded) {
      return;
    }

    let isActive = true;
    let retryTimeoutId: number | undefined;

    const refreshUntilLoaded = async () => {
      const agentChatThreads = await refreshAgentChatThreads();

      if (!isActive || isDefined(agentChatThreads)) {
        return;
      }

      retryTimeoutId = window.setTimeout(
        () => void refreshUntilLoaded(),
        AGENT_CHAT_THREADS_REFRESH_RETRY_DELAY_MS,
      );
    };

    void refreshUntilLoaded();

    return () => {
      isActive = false;

      if (isDefined(retryTimeoutId)) {
        window.clearTimeout(retryTimeoutId);
      }
    };
  }, [
    agentChatThreadsLoading,
    areFieldMetadataItemsLoaded,
    refreshAgentChatThreads,
  ]);

  useEffect(() => {
    if (hasInitializedAgentChatThreads || agentChatThreadsLoading) {
      return;
    }

    if (isDefined(currentAiChatThread)) {
      const selectedThread = store.get(
        agentChatThreadRecordFamilySelector.selectorFamily(currentAiChatThread),
      );

      if (isDefined(selectedThread)) {
        store.set(
          agentChatUsageFamilyState.atomFamily({ threadId: selectedThread.id }),
          getAgentChatUsageFromThread(selectedThread),
        );
      }
      setHasInitializedAgentChatThreads(true);
      return;
    }

    setHasInitializedAgentChatThreads(true);

    const sortedThreads = sortChatThreadsByLastActivityDesc(
      agentChatVisibleThreads,
    );

    if (sortedThreads.length > 0) {
      const firstThread = sortedThreads[0];

      setCurrentAiChatThread(firstThread.id);
      store.set(
        agentChatUsageFamilyState.atomFamily({ threadId: firstThread.id }),
        getAgentChatUsageFromThread(firstThread),
      );
    } else {
      setCurrentAiChatThread(store.get(newAiChatThreadIdState.atom));
    }
  }, [
    agentChatVisibleThreads,
    currentAiChatThread,
    agentChatThreadsLoading,
    hasInitializedAgentChatThreads,
    setHasInitializedAgentChatThreads,
    setCurrentAiChatThread,
    store,
  ]);

  return null;
};
