import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { getAgentChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSwitchAgentChatThreadWithDraft = () => {
  const [currentAiChatThread, setCurrentAiChatThread] = useAtomState(
    currentAiChatThreadState,
  );
  const store = useStore();
  const usageFamilyCallback = useAtomComponentFamilyStateCallbackState(
    agentChatUsageComponentFamilyState,
    AGENT_CHAT_INSTANCE_ID,
  );

  const switchThreadWithDraft = useCallback(
    (toThreadId: string) => {
      const isSameThread = toThreadId === currentAiChatThread;

      setCurrentAiChatThread(toThreadId);

      if (!isSameThread) {
        const thread = store.get(
          agentChatThreadRecordFamilySelector.selectorFamily(toThreadId),
        );

        store.set(
          usageFamilyCallback({ threadId: toThreadId }),
          isDefined(thread) ? getAgentChatUsageFromThread(thread) : null,
        );
      }
    },
    [currentAiChatThread, setCurrentAiChatThread, store, usageFamilyCallback],
  );

  return { switchThreadWithDraft };
};
