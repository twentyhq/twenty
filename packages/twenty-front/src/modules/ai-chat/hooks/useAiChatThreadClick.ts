import { useSelectAiChatThread } from '@/ai-chat/hooks/useSelectAiChatThread';
import { useNavigateToAiChatPage } from '@/ai-chat/hooks/useNavigateToAiChatPage';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { isInboxPath } from '~/utils/isInboxPath';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

type UseAiChatThreadClickOptions = {
  resetNavigationStack?: boolean;
  shouldOpenInFullPage?: boolean;
};

export const useAiChatThreadClick = (
  options: UseAiChatThreadClickOptions = {},
) => {
  const { resetNavigationStack = false, shouldOpenInFullPage = false } =
    options;
  const { selectAiChatThread } = useSelectAiChatThread();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const { navigateToAiChatPage } = useNavigateToAiChatPage();

  const handleThreadClick = (thread: Pick<AiChatThreadRecord, 'id'>) => {
    const isOnChatPage =
      isCurrentPathAiChatPage() || isInboxPath(window.location.pathname);

    if (!isOnChatPage && !shouldOpenInFullPage) {
      openAskAiPage({ threadId: thread.id, resetNavigationStack });

      return;
    }

    selectAiChatThread(thread.id);

    if (!isOnChatPage) {
      navigateToAiChatPage({ threadId: thread.id });
    }
  };

  return { handleThreadClick };
};
