import { useStore } from 'jotai';
import { useAiChatThreadClick } from '@/ai-chat/threads/hooks/useAiChatThreadClick';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

export const useOpenAskAiThread = () => {
  const store = useStore();

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

    openAskAiPage({
      threadId: isValidUuid(threadId) ? threadId : undefined,
      resetNavigationStack: true,
    });
  };

  return { openAskAiThread };
};
