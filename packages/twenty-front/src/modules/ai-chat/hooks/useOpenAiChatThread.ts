import { useNavigateToAiChatPage } from '@/ai-chat/hooks/useNavigateToAiChatPage';
import { useSelectAiChatThread } from '@/ai-chat/hooks/useSelectAiChatThread';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isAiModePath } from '~/utils/isAiModePath';

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
    const isOnAiModePage = isAiModePath(window.location.pathname);

    if (!isOnAiModePage && !shouldOpenInFullPage) {
      openAskAiPage({ threadId, resetNavigationStack });

      return;
    }

    selectAiChatThread(threadId);

    if (!isOnAiModePage) {
      navigateToAiChatPage({ threadId });
    }
  };

  return { openAiChatThread };
};
