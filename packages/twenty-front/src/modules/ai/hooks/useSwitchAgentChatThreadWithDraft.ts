import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

// Moves the selection and carries the destination's draft into the editor,
// without touching the URL. Use useSelectAiChatThread for a thread the user
// picked, so the chat page's URL follows.
export const useSwitchAgentChatThreadWithDraft = () => {
  const [currentAiChatThread, setCurrentAiChatThread] = useAtomState(
    currentAiChatThreadState,
  );
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const store = useStore();

  const switchThreadWithDraft = useCallback(
    (toThreadId: string) => {
      const isSameThread = toThreadId === currentAiChatThread;

      setCurrentAiChatThread(toThreadId);

      if (!isSameThread) {
        const destinationDraft =
          store.get(agentChatDraftsByThreadIdState.atom)[toThreadId] ?? '';
        setAgentChatInput(tipTapDocumentToMarkdown(destinationDraft));
      }
    },
    [currentAiChatThread, setCurrentAiChatThread, setAgentChatInput, store],
  );

  return { switchThreadWithDraft };
};
