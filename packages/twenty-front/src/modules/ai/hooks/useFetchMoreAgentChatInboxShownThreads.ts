import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { useLoadAgentChatChannelThreads } from '@/ai/hooks/useLoadAgentChatChannelThreads';
import { useFetchMoreAgentChatThreadsInFilterStatus } from '@/ai/hooks/useFetchMoreAgentChatThreadsInFilterStatus';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';

export const useFetchMoreAgentChatInboxShownThreads = () => {
  const store = useStore();
  const { fetchMoreAgentChatThreadsInFilterStatus } =
    useFetchMoreAgentChatThreadsInFilterStatus();
  const { loadAgentChatChannelThreads } = useLoadAgentChatChannelThreads();

  const fetchMoreAgentChatInboxShownThreads = () => {
    const isChannelView = isDefined(
      store.get(agentChatShownChannelViewSelector.atom),
    );

    if (isChannelView) {
      void loadAgentChatChannelThreads('fetch-more');
      return;
    }

    void fetchMoreAgentChatThreadsInFilterStatus(
      store.get(agentChatThreadFilterStatusState.atom),
    );
  };

  return { fetchMoreAgentChatInboxShownThreads };
};
