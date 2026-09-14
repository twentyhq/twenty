import { useStore } from 'jotai';

import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type UseSwitchToNewAiChatParams = {
  shouldOpenInFullPage?: boolean;
};

export const useSwitchToNewAiChat = ({
  shouldOpenInFullPage = false,
}: UseSwitchToNewAiChatParams = {}) => {
  const setThreadIdCreatedFromDraft = useSetAtomState(
    threadIdCreatedFromDraftState,
  );
  const { selectAiChatThread } = useSelectAiChatThread();
  const store = useStore();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const { navigateToAiChatPage } = useNavigateToAiChatPage();

  const switchToNewChat = () => {
    setThreadIdCreatedFromDraft(null);
    store.set(hasTriggeredCreateForDraftState.atom, false);
    selectAiChatThread(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);

    if (shouldOpenInFullPage) {
      navigateToAiChatPage();
    } else {
      openAskAiPage();
    }

    store.set(shouldFocusChatEditorState.atom, true);
  };

  return { switchToNewChat };
};
