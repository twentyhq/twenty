import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useNavigateToAiChatPage } from '@/ai/hooks/useNavigateToAiChatPage';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';
import { type AgentChatThread } from '~/generated-metadata/graphql';
import { isCurrentPathAiChatChannelPage } from '~/utils/isCurrentPathAiChatChannelPage';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export type UseAiChatThreadClickOptions = {
  resetNavigationStack?: boolean;
};

export const useAiChatThreadClick = (
  options: UseAiChatThreadClickOptions = {},
) => {
  const { resetNavigationStack = false } = options;
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

  const handleThreadClick = (thread: AgentChatThread) => {
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

    // A channel page lists threads of the full chat page, so it opens them
    // there rather than in the side panel.
    if (isCurrentPathAiChatChannelPage()) {
      navigateToAiChatPage({ threadId: thread.id });

      return;
    }

    openAskAiPage({
      resetNavigationStack,
    });
  };

  return { handleThreadClick };
};
