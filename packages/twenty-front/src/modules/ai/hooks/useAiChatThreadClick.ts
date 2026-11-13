import { useSelectInboxThread } from '@/ai/hooks/useSelectAiChatThread';
import { useNavigateToInboxThreadPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { isInboxPath } from '~/utils/isAiChatInboxPath';
import { isCurrentPathInboxThreadPage } from '~/utils/isCurrentPathAiChatPage';

type UseInboxThreadClickOptions = {
  resetNavigationStack?: boolean;
  shouldOpenInFullPage?: boolean;
};

export const useInboxThreadClick = (
  options: UseInboxThreadClickOptions = {},
) => {
  const { resetNavigationStack = false, shouldOpenInFullPage = false } =
    options;
  const { selectInboxThread } = useSelectInboxThread();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const { navigateToInboxThreadPage } = useNavigateToInboxThreadPage();

  const handleThreadClick = (thread: Pick<InboxThreadRecord, 'id'>) => {
    selectInboxThread(thread.id);

    const isOnChatPage =
      isCurrentPathInboxThreadPage() || isInboxPath(window.location.pathname);

    if (isOnChatPage) {
      return;
    }

    if (shouldOpenInFullPage) {
      navigateToInboxThreadPage({ threadId: thread.id });

      return;
    }

    openAskAiPage({
      resetNavigationStack,
    });
  };

  return { handleThreadClick };
};
