import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { getAgentChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { type AgentChatThread } from '~/generated-metadata/graphql';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined, tipTapDocumentToMarkdown } from 'twenty-shared/utils';

export const useSwitchAgentChatThreadWithDraft = () => {
  const [currentAiChatThread, setCurrentAiChatThread] = useAtomState(
    currentAiChatThreadState,
  );
  const setAgentChatInput = useSetAtomState(agentChatInputState);
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
        const threads = store.get(
          metadataStoreState.atomFamily('agentChatThreads'),
        ).current as AgentChatThread[];
        const thread = threads.find(({ id }) => id === toThreadId);
        store.set(
          usageFamilyCallback({ threadId: toThreadId }),
          isDefined(thread) ? getAgentChatUsageFromThread(thread) : null,
        );
        const destinationDraft =
          store.get(agentChatDraftsByThreadIdState.atom)[toThreadId] ?? '';
        setAgentChatInput(tipTapDocumentToMarkdown(destinationDraft));
      }
    },
    [
      currentAiChatThread,
      setCurrentAiChatThread,
      setAgentChatInput,
      store,
      usageFamilyCallback,
    ],
  );

  return { switchThreadWithDraft };
};
