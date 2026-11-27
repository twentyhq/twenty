import { useStore } from 'jotai';

import { useNavigateToAiChatPage } from '@/ai-chat/hooks/useNavigateToAiChatPage';
import { useSelectAiChatThread } from '@/ai-chat/hooks/useSelectAiChatThread';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { inboxRecordRouteObjectNamesSelector } from '@/ai-chat/states/selectors/inboxRecordRouteObjectNamesSelector';
import { isAiModePath } from '~/utils/isAiModePath';

export const useOpenAiChatThread = () => {
  const store = useStore();
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
    const isOnAiModePage = isAiModePath(
      window.location.pathname,
      store.get(inboxRecordRouteObjectNamesSelector.atom),
    );

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
