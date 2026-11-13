import { useStore } from 'jotai';

import { useNavigateToInboxThreadPage } from '@/ai/hooks/useNavigateToInboxThreadPage';
import { useSelectInboxThread } from '@/ai/hooks/useSelectInboxThread';
import { inboxNewThreadChannelIdState } from '@/ai/states/inboxNewThreadChannelIdState';
import { newInboxThreadIdState } from '@/ai/states/newInboxThreadIdState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isInboxPath } from '~/utils/isInboxPath';

type UseSwitchToNewAiChatParams = {
  shouldOpenInFullPage?: boolean;
};

export const useSwitchToNewAiChat = ({
  shouldOpenInFullPage = false,
}: UseSwitchToNewAiChatParams = {}) => {
  const { selectInboxThread } = useSelectInboxThread();
  const store = useStore();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const { navigateToInboxThreadPage } = useNavigateToInboxThreadPage();

  const switchToNewChat = () => {
    const isOnInboxPage = isInboxPath(window.location.pathname);

    if (!isOnInboxPage) {
      store.set(inboxNewThreadChannelIdState.atom, null);
    }

    const newInboxThreadId = store.get(newInboxThreadIdState.atom);

    selectInboxThread(newInboxThreadId);

    const shouldNavigateToChatPage = shouldOpenInFullPage && !isOnInboxPage;

    if (shouldNavigateToChatPage) {
      navigateToInboxThreadPage();
    }

    if (!shouldOpenInFullPage && !isOnInboxPage) {
      openAskAiPage();
    }

    store.set(shouldFocusChatEditorState.atom, true);

    return newInboxThreadId;
  };

  return { switchToNewChat };
};
