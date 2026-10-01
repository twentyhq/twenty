import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useChatThreads = () => {
  const agentChatVisibleThreads = useAtomStateValue(
    agentChatVisibleThreadsSelector,
  );
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);

  return {
    threads: sortChatThreadsByLastActivityDesc(agentChatVisibleThreads),
    loading: agentChatThreadList === null,
  };
};
