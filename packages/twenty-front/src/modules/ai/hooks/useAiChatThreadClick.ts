import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';
import { type AgentChatThread } from '~/generated-metadata/graphql';
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

    openAskAiPage({
      resetNavigationStack,
    });
  };

  return { handleThreadClick };
};
