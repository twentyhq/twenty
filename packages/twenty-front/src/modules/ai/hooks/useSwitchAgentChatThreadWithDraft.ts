import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { getAgentChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSwitchAgentChatThreadWithDraft = () => {
  const [currentAiChatThread, setCurrentAiChatThread] = useAtomState(
    currentAiChatThreadState,
  );
  const store = useStore();

  const switchThreadWithDraft = useCallback(
    (toThreadId: string) => {
      const isSameThread = toThreadId === currentAiChatThread;

      setCurrentAiChatThread(toThreadId);

      if (!isSameThread) {
        const thread = store.get(
          agentChatThreadRecordFamilySelector.selectorFamily(toThreadId),
        );

        store.set(
          agentChatUsageFamilyState.atomFamily({ threadId: toThreadId }),
          isDefined(thread) ? getAgentChatUsageFromThread(thread) : null,
        );
      }
    },
    [currentAiChatThread, setCurrentAiChatThread, store],
  );

  return { switchThreadWithDraft };
};
