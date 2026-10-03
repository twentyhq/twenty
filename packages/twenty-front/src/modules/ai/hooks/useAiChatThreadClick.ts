import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';
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
  const threadTitleFamilyCallback = useAtomComponentFamilyStateCallbackState(
    currentAiChatThreadTitleComponentFamilyState,
  );
  const store = useStore();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const { navigateToAiChatPage } = useNavigateToAiChatPage();

  const handleThreadClick = (
    thread: Pick<AgentChatThreadRecord, 'id' | 'title'>,
  ) => {
    setThreadIdCreatedFromDraft(null);

    selectAiChatThread(thread.id);

    const clickedFamilyKey = { threadId: thread.id };

    store.set(
      threadTitleFamilyCallback(clickedFamilyKey),
      thread.title ?? null,
    );

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
