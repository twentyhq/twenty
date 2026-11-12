import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useRefreshAgentChatChannelSummaries } from '@/ai/hooks/useRefreshAgentChatChannelSummaries';
import { AGENT_CHAT_DEFAULT_SELECTED_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatDefaultSelectedThreadListSource';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { isAgentChatSelectedThreadListSourceAccessible } from '@/ai/utils/isAgentChatSelectedThreadListSourceAccessible';
import { GetAgentChatChannelsDocument } from '~/generated-metadata/graphql';

// A failed load keeps what was shown, as the next change loads again
export const useRefreshAgentChatChannels = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { refreshAgentChatChannelSummaries } =
    useRefreshAgentChatChannelSummaries();

  const refreshAgentChatChannels = useCallback(async () => {
    const [channelsResult] = await Promise.all([
      apolloClient
        .query({
          query: GetAgentChatChannelsDocument,
          fetchPolicy: 'network-only',
        })
        .catch(() => undefined),
      refreshAgentChatChannelSummaries(),
    ]);

    const channels = channelsResult?.data?.agentChatChannels;

    if (!isDefined(channels)) {
      return;
    }

    store.set(agentChatChannelsState.atom, channels);

    if (
      !isAgentChatSelectedThreadListSourceAccessible({
        source: store.get(agentChatSelectedThreadListSourceState.atom),
        channels,
      })
    ) {
      store.set(
        agentChatSelectedThreadListSourceState.atom,
        AGENT_CHAT_DEFAULT_SELECTED_THREAD_LIST_SOURCE,
      );
    }
  }, [apolloClient, refreshAgentChatChannelSummaries, store]);

  return { refreshAgentChatChannels };
};
