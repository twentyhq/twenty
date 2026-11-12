import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { useLoadAgentChatThreadList } from '@/ai/hooks/useLoadAgentChatThreadList';
import { agentChatThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { type AgentChatThreadListSource } from '@/ai/types/AgentChatThreadListSource';
import { getAgentChatThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

type AgentChatThreadListLoadEffectProps = {
  source: AgentChatThreadListSource;
};

export const AgentChatThreadListLoadEffect = ({
  source,
}: AgentChatThreadListLoadEffectProps) => {
  const isRecentThreadListLoaded = isDefined(
    useAtomFamilyStateValue(
      agentChatThreadListFamilyState,
      getAgentChatThreadListSourceKey(AGENT_CHAT_RECENT_THREAD_LIST_SOURCE),
    ),
  );
  const { loadAgentChatThreadList } = useLoadAgentChatThreadList();
  const sourceKey = getAgentChatThreadListSourceKey(source);

  useEffect(() => {
    if (isRecentThreadListLoaded) {
      void loadAgentChatThreadList({ source, mode: 'refresh' });
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecentThreadListLoaded, loadAgentChatThreadList, sourceKey]);

  return null;
};
