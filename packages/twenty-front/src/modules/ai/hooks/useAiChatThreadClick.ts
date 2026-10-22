import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';
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

  const handleThreadClick = (thread: Pick<AgentChatThreadRecord, 'id'>) => {
    selectAiChatThread(thread.id);

    const isOnChatPage =
      isCurrentPathAiChatPage() || isAiChatInboxPath(window.location.pathname);

    if (isOnChatPage) {
      return;
    }

    if (shouldOpenInFullPage) {
      navigateToAiChatPage({ threadId: thread.id });

      return;
    }

    openAskAiPage({
      resetNavigationStack,
    });
  };

  return { handleThreadClick };
};
