import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { useLoadAgentChatChannelThreads } from '@/ai/hooks/useLoadAgentChatChannelThreads';
import { useFetchMoreAgentChatThreads } from '@/ai/hooks/useFetchMoreAgentChatThreads';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';

export const useFetchMoreAgentChatInboxShownThreads = () => {
  const store = useStore();
  const { fetchMoreAgentChatThreads } = useFetchMoreAgentChatThreads();
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
