import { useStore } from 'jotai';

import { useNavigateToAiChatPage } from '@/ai-chat/hooks/useNavigateToAiChatPage';
import { useSelectAiChatThread } from '@/ai-chat/hooks/useSelectAiChatThread';
import { aiChatNewThreadChannelIdState } from '@/ai-chat/composer/states/aiChatNewThreadChannelIdState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { shouldFocusChatEditorState } from '@/ai-chat/states/shouldFocusChatEditorState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';
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

    if (shouldOpenInFullPage || isOnInboxPage || isCurrentPathAiChatPage()) {
      selectAiChatThread(newAiChatThreadId);
    } else {
      openAskAiPage({ threadId: newAiChatThreadId });
    }

    if (shouldOpenInFullPage && !isOnInboxPage) {
      navigateToAiChatPage();
    }

    store.set(shouldFocusChatEditorState.atom, true);

    return newAiChatThreadId;
  };

  return { switchToNewChat };
};
