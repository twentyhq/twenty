import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { useLoadAgentChatChannelThreads } from '@/ai/hooks/useLoadAgentChatChannelThreads';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';

export const useFetchMoreAgentChatInboxShownThreads = () => {
  const store = useStore();
  const { fetchMoreAgentChatThreads, fetchMoreAgentChatSnoozedThreads } =
    useRefreshAgentChatThreads();
  const { loadAgentChatChannelThreads } = useLoadAgentChatChannelThreads();

  const fetchMoreAgentChatInboxShownThreads = () => {
    const isChannelView = isDefined(
      store.get(agentChatShownChannelViewSelector.atom),
    );

    if (isChannelView) {
      void loadAgentChatChannelThreads('fetch-more');
      return;
    }

    if (
      store.get(agentChatThreadFilterStatusState.atom) ===
      AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED
    ) {
      void fetchMoreAgentChatSnoozedThreads();
      return;
    }

    void fetchMoreAgentChatThreads();
  };

  return { fetchMoreAgentChatInboxShownThreads };
};
