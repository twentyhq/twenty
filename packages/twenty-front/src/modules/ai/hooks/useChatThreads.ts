import { useInView } from 'react-intersection-observer';

import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useChatThreads = () => {
  const agentChatVisibleThreads = useAtomStateValue(
    agentChatVisibleThreadsSelector,
  );
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);
  const { fetchMoreAgentChatThreads } = useRefreshAgentChatThreads();

  const { ref: fetchMoreRef } = useInView({
    onChange: (inView) => {
      if (inView) {
        void fetchMoreAgentChatThreads();
      }
    },
  });

  return {
    threads: sortChatThreadsByLastActivityDesc(agentChatVisibleThreads),
    hasNextPage: agentChatThreadList?.hasNextPage ?? false,
    loading: agentChatThreadList === null,
    fetchMoreRef,
  };
};
