import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useRefreshAgentChatChannelSummaries } from '@/ai/hooks/useRefreshAgentChatChannelSummaries';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
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

    if (isDefined(channels)) {
      store.set(agentChatChannelsState.atom, channels);
    }
  }, [apolloClient, refreshAgentChatChannelSummaries, store]);

  return { refreshAgentChatChannels };
};
