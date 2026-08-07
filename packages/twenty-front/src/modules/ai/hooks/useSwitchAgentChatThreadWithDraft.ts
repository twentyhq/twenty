import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { selectedInboxItemIdState } from '@/inbox/states/selectedInboxItemIdState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';
import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

export const useSwitchAgentChatThreadWithDraft = () => {
  const [currentAiChatThread, setCurrentAiChatThread] = useAtomState(
    currentAiChatThreadState,
  );
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const setSelectedInboxItemId = useSetAtomState(selectedInboxItemIdState);
  const store = useStore();

  const switchThreadWithDraft = (toThreadId: string) => {
    const isSameThread = toThreadId === currentAiChatThread;

    setSelectedInboxItemId(null);
    setCurrentAiChatThread(toThreadId);

    if (!isSameThread) {
      const destinationDraft =
        store.get(agentChatDraftsByThreadIdState.atom)[toThreadId] ?? '';
      setAgentChatInput(tipTapDocumentToMarkdown(destinationDraft));
    }
  };

  return { switchThreadWithDraft };
};
