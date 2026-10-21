import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { useLoadAgentChatChannelThreads } from '@/ai/hooks/useLoadAgentChatChannelThreads';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';

export const useFetchMoreAgentChatInboxShownThreads = () => {
  const store = useStore();
  const { fetchMoreAgentChatThreads } = useRefreshAgentChatThreads();
  const { loadAgentChatChannelThreads } = useLoadAgentChatChannelThreads();

  const fetchMoreAgentChatInboxShownThreads = () => {
    const isChannelView = isDefined(
      store.get(agentChatShownChannelViewSelector.atom),
    );

    if (isChannelView) {
      void loadAgentChatChannelThreads('fetch-more');
      return;
    }

    void fetchMoreAgentChatThreads();
  };

  return { fetchMoreAgentChatInboxShownThreads };
};
