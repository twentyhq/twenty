import { useStore } from 'jotai';

import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useSwitchToNewAiChat = () => {
  const setThreadIdCreatedFromDraft = useSetAtomState(
    threadIdCreatedFromDraftState,
  );
  const [currentAiChatThread, setCurrentAiChatThread] = useAtomState(
    currentAiChatThreadState,
  );
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const store = useStore();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  const switchToNewChat = () => {
    setThreadIdCreatedFromDraft(null);
    const newChatDraft =
      store.get(agentChatDraftsByThreadIdState.atom)[
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY
      ] ?? '';
    if (currentAiChatThread !== null) {
      setAgentChatDraftsByThreadId((prev) => ({
        ...prev,
        [currentAiChatThread]: store.get(agentChatInputState.atom),
      }));
    }
    store.set(hasTriggeredCreateForDraftState.atom, false);
    setCurrentAiChatThread(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
    setAgentChatInput(newChatDraft);
    openAskAiPage();
    store.set(shouldFocusChatEditorState.atom, true);
  };

  return { switchToNewChat };
};
