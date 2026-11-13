import { aiChatUsageFamilyState } from '@/ai/states/aiChatUsageFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { getAiChatUsageFromThread } from '@/ai/utils/getAiChatUsageFromThread';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSwitchAiChatThreadWithDraft = () => {
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
          aiChatThreadRecordFamilySelector.selectorFamily(toThreadId),
        );

        store.set(
          aiChatUsageFamilyState.atomFamily({ threadId: toThreadId }),
          isDefined(thread) ? getAiChatUsageFromThread(thread) : null,
        );
      }
    },
    [currentAiChatThread, setCurrentAiChatThread, store],
  );

  return { switchThreadWithDraft };
};
