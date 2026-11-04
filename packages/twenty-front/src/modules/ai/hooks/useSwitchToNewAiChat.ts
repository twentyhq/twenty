import { useStore } from 'jotai';

import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { agentChatNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';

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
    const isOnInboxPage = isAiChatInboxPath(window.location.pathname);

    if (!isOnInboxPage) {
      store.set(agentChatNewThreadChannelIdState.atom, null);
    }

    selectAiChatThread(store.get(newAiChatThreadIdState.atom));

    const shouldNavigateToChatPage = shouldOpenInFullPage && !isOnInboxPage;

    if (shouldNavigateToChatPage) {
      navigateToAiChatPage();
    }

    if (!shouldOpenInFullPage && !isOnInboxPage) {
      openAskAiPage();
    }

    store.set(shouldFocusChatEditorState.atom, true);
  };

  return { switchToNewChat };
};
