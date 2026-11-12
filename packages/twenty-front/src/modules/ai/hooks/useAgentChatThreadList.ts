import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { agentChatThreadListThreadsFamilySelector } from '@/ai/states/selectors/agentChatThreadListThreadsFamilySelector';
import { type AgentChatThreadListSource } from '@/ai/types/AgentChatThreadListSource';
import { getAgentChatThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const useAgentChatThreadList = (source: AgentChatThreadListSource) => {
  const threads = useAtomFamilySelectorValue(
    agentChatThreadListThreadsFamilySelector,
    source,
  );
  const agentChatThreadList = useAtomFamilyStateValue(
    agentChatThreadListFamilyState,
    getAgentChatThreadListSourceKey(source),
  );

  const sortedThreads = useMemo(
    () => sortChatThreadsByLastActivityDesc(threads),
    [threads],
  );

  return {
    threads: sortedThreads,
    agentChatThreadList,
    isLoading: !isDefined(agentChatThreadList),
  };
};
