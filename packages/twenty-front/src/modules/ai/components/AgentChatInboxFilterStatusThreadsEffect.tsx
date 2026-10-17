import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Also runs after a refresh, which replaces the list along with its tab pages
export const AgentChatInboxFilterStatusThreadsEffect = () => {
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);
  const { refreshAgentChatThreadsInFilterStatus } =
    useRefreshAgentChatThreads();
  const isListLoaded = isDefined(agentChatThreadList);
  const isFilterStatusLoaded = isDefined(
    agentChatThreadList?.filterStatusPages?.[agentChatThreadFilterStatus],
  );

  useEffect(() => {
    if (!isListLoaded || isFilterStatusLoaded) {
      return;
    }

    void refreshAgentChatThreadsInFilterStatus(agentChatThreadFilterStatus);
  }, [
    agentChatThreadFilterStatus,
    isFilterStatusLoaded,
    isListLoaded,
    refreshAgentChatThreadsInFilterStatus,
  ]);

  return null;
};
