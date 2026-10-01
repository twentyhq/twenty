import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type Selector } from '@/ui/utilities/state/jotai/types/Selector';

export const useChatThreads = (
  threadsSelector: Selector<AgentChatThreadRecord[]>,
) => {
  const threads = useAtomStateValue(threadsSelector);
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);

  return {
    threads: sortChatThreadsByLastActivityDesc(threads),
    loading: agentChatThreadList === null,
  };
};
