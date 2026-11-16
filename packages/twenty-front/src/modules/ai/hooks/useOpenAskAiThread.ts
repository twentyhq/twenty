import { useStore } from 'jotai';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

export const useOpenAskAiThread = () => {
  const store = useStore();
  const { selectAiChatThread } = useSelectAiChatThread();

  const { handleThreadClick } = useAiChatThreadClick({
    resetNavigationStack: true,
  });
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  const openAskAiThread = (threadId: string) => {
    const thread = store.get(
      aiChatThreadRecordFamilySelector.selectorFamily(threadId),
    );

    if (isDefined(thread) && !isDefined(thread.deletedAt)) {
      handleThreadClick(thread);
      return;
    }

    if (isValidUuid(threadId)) {
      selectAiChatThread(threadId);
    }

    openAskAiPage({ resetNavigationStack: true });
  };

  return { openAskAiThread };
};
