import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { useLoadAgentChatChannelThreads } from '@/ai/hooks/useLoadAgentChatChannelThreads';
import { useLoadAgentChatInboxTabThreads } from '@/ai/hooks/useLoadAgentChatInboxTabThreads';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';

export const useFetchMoreAgentChatInboxShownThreads = () => {
  const store = useStore();
  const { loadAgentChatInboxTabThreads } = useLoadAgentChatInboxTabThreads();
  const { loadAgentChatChannelThreads } = useLoadAgentChatChannelThreads();

  const fetchMoreAgentChatInboxShownThreads = () => {
    const isChannelView = isDefined(
      store.get(agentChatShownChannelViewSelector.atom),
    );

    if (isChannelView) {
      void loadAgentChatChannelThreads('fetch-more');
      return;
    }

    void loadAgentChatInboxTabThreads('fetch-more');
  };

  return { fetchMoreAgentChatInboxShownThreads };
};
