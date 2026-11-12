import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { agentChatSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { agentChatThreadListThreadsFamilySelector } from '@/ai/states/selectors/agentChatThreadListThreadsFamilySelector';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

export const useOpenAskAiThread = () => {
  const agentChatSelectedThreadListSource = useAtomStateValue(
    agentChatSelectedThreadListSourceState,
  );
  const agentChatThreadListThreads = useAtomFamilySelectorValue(
    agentChatThreadListThreadsFamilySelector,
    agentChatSelectedThreadListSource,
  );
  const { selectAiChatThread } = useSelectAiChatThread();

  const { handleThreadClick } = useAiChatThreadClick({
    resetNavigationStack: true,
  });
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  const openAskAiThread = (threadId: string) => {
    const thread = agentChatThreadListThreads.find(
      (visibleThread) => visibleThread.id === threadId,
    );

    if (isDefined(thread)) {
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
