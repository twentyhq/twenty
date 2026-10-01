import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useRecentChatThreads = () => {
  const agentChatRecentThreads = useAtomStateValue(
    agentChatRecentThreadsSelector,
  );
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);

  return {
    threads: sortChatThreadsByLastActivityDesc(agentChatRecentThreads),
    loading: agentChatThreadList === null,
  };
};
