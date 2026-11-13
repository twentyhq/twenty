import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { getAgentChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSwitchInboxThreadWithDraft = () => {
  const [currentInboxThread, setCurrentInboxThread] = useAtomState(
    currentInboxThreadState,
  );
  const store = useStore();

  const switchThreadWithDraft = useCallback(
    (toThreadId: string) => {
      const isSameThread = toThreadId === currentInboxThread;

      setCurrentInboxThread(toThreadId);

      if (!isSameThread) {
        const thread = store.get(
          inboxThreadRecordFamilySelector.selectorFamily(toThreadId),
        );

        store.set(
          agentChatUsageFamilyState.atomFamily({ threadId: toThreadId }),
          isDefined(thread) ? getAgentChatUsageFromThread(thread) : null,
        );
      }
    },
    [currentInboxThread, setCurrentInboxThread, store],
  );

  return { switchThreadWithDraft };
};
