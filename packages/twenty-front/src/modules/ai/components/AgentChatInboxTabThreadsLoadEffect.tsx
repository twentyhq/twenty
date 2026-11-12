import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useLoadAgentChatInboxTabThreads } from '@/ai/hooks/useLoadAgentChatInboxTabThreads';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AgentChatInboxTabThreadsLoadEffect = () => {
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const isChannelViewShown = isDefined(
    useAtomStateValue(agentChatShownChannelViewSelector),
  );
  const isThreadListLoaded = isDefined(
    useAtomStateValue(agentChatThreadListState),
  );
  const { loadAgentChatInboxTabThreads } = useLoadAgentChatInboxTabThreads();

  useEffect(() => {
    if (!isChannelViewShown && isThreadListLoaded) {
      void loadAgentChatInboxTabThreads('refresh');
    }
  }, [
    agentChatThreadFilterStatus,
    isChannelViewShown,
    isThreadListLoaded,
    loadAgentChatInboxTabThreads,
  ]);

  return null;
};
