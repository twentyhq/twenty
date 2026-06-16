import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isDefined, isValidUuid } from 'twenty-shared/utils';


export const useOpenAskAiThread = () => {
  const agentChatVisibleThreads = useAtomStateValue(
    agentChatVisibleThreadsSelector,
  );
  const setCurrentAiChatThread = useSetAtomState(currentAiChatThreadState);

  const { handleThreadClick } = useAiChatThreadClick({
    resetNavigationStack: true,
  });
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  const openAskAiThread = (threadId: string) => {
    const thread = agentChatVisibleThreads.find(
      (visibleThread) => visibleThread.id === threadId,
    );

    if (isDefined(thread)) {
      handleThreadClick(thread);
      return;
    }

    if (isValidUuid(threadId)) {
      setCurrentAiChatThread(threadId);
    }

    openAskAiPage({ resetNavigationStack: true });
  };

  return { openAskAiThread };
};
