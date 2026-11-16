import { useStore } from 'jotai';

import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { aiChatNewThreadChannelIdState } from '@/ai/states/aiChatNewThreadChannelIdState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isInboxPath } from '~/utils/isInboxPath';

type UseSwitchToNewAiChatParams = {
  shouldOpenInFullPage?: boolean;
};

export const useSwitchToNewAiChat = ({
  shouldOpenInFullPage = false,
}: UseSwitchToNewAiChatParams = {}) => {
  const { selectAiChatThread } = useSelectAiChatThread();
  const store = useStore();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const { navigateToAiChatPage } = useNavigateToAiChatPage();

  const switchToNewChat = () => {
    const isOnInboxPage = isInboxPath(window.location.pathname);

    if (!isOnInboxPage) {
      store.set(aiChatNewThreadChannelIdState.atom, null);
    }

    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);

    selectAiChatThread(newAiChatThreadId);

    const shouldNavigateToChatPage = shouldOpenInFullPage && !isOnInboxPage;

    if (shouldNavigateToChatPage) {
      navigateToAiChatPage();
    }

    if (!shouldOpenInFullPage && !isOnInboxPage) {
      openAskAiPage();
    }

    store.set(shouldFocusChatEditorState.atom, true);

    return newAiChatThreadId;
  };

  return { switchToNewChat };
};
