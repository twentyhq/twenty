import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export type UseAiChatThreadClickOptions = {
  resetNavigationStack?: boolean;
  shouldOpenInFullPage?: boolean;
};

export const useAiChatThreadClick = (
  options: UseAiChatThreadClickOptions = {},
) => {
  const { resetNavigationStack = false, shouldOpenInFullPage = false } =
    options;
  const setThreadIdCreatedFromDraft = useSetAtomState(
    threadIdCreatedFromDraftState,
  );
  const { selectAiChatThread } = useSelectAiChatThread();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const { navigateToAiChatPage } = useNavigateToAiChatPage();

  const handleThreadClick = (thread: Pick<AgentChatThreadRecord, 'id'>) => {
    setThreadIdCreatedFromDraft(null);

    selectAiChatThread(thread.id);

    if (isCurrentPathAiChatPage()) {
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
