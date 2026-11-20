import { useNavigateToAiChatPage } from '@/ai-chat/hooks/useNavigateToAiChatPage';
import { useSelectAiChatThread } from '@/ai-chat/hooks/useSelectAiChatThread';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';
import { isInboxPath } from '~/utils/isInboxPath';

export const useOpenAiChatThread = () => {
  const { selectAiChatThread } = useSelectAiChatThread();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const { navigateToAiChatPage } = useNavigateToAiChatPage();

  const openAiChatThread = ({
    threadId,
    shouldOpenInFullPage = false,
    resetNavigationStack,
  }: {
    threadId: string;
    shouldOpenInFullPage?: boolean;
    resetNavigationStack?: boolean;
  }) => {
    const isOnAiChatPage =
      isCurrentPathAiChatPage() || isInboxPath(window.location.pathname);

    if (!isOnAiChatPage && !shouldOpenInFullPage) {
      openAskAiPage({ threadId, resetNavigationStack });

      return;
    }

    selectAiChatThread(threadId);

    if (!isOnAiChatPage) {
      navigateToAiChatPage({ threadId });
    }
  };

  return { openAiChatThread };
};
