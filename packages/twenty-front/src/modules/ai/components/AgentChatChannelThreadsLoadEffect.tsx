import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useLoadAgentChatChannelThreads } from '@/ai/hooks/useLoadAgentChatChannelThreads';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { getAgentChatChannelViewKey } from '@/ai/utils/getAgentChatChannelViewKey';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Chats are added to the loaded list, so the first page waits for it
export const AgentChatChannelThreadsLoadEffect = () => {
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const isThreadListLoaded = isDefined(
    useAtomStateValue(agentChatThreadListState),
  );
  const { loadAgentChatChannelThreads } = useLoadAgentChatChannelThreads();
  const channelViewKey = isDefined(agentChatShownChannelView)
    ? getAgentChatChannelViewKey(agentChatShownChannelView)
    : null;

  useEffect(() => {
    if (isDefined(channelViewKey) && isThreadListLoaded) {
      void loadAgentChatChannelThreads('refresh');
    }
  }, [channelViewKey, isThreadListLoaded, loadAgentChatChannelThreads]);

  return null;
};
