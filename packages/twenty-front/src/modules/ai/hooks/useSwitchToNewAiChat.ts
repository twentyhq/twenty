import { useStore } from 'jotai';

import { AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AgentChatNewThreadDefaultRecipients';
import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { agentChatNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import { agentChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
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
    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);

    if (!isOnInboxPage) {
      store.set(agentChatNewThreadChannelIdState.atom, null);
    }

    store.set(
      agentChatNewThreadRecipientsFamilyState.atomFamily(newAiChatThreadId),
      AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
    );
    selectAiChatThread(newAiChatThreadId);

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
