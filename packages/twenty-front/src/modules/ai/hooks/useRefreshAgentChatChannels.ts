import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import {
  GetAgentChatChannelsDocument,
  GetAgentChatInboxSummaryDocument,
} from '~/generated-metadata/graphql';

// A failed load keeps what was shown, as the next change loads again
export const useRefreshAgentChatChannels = () => {
  const apolloClient = useApolloClient();
  const store = useStore();

  const refreshAgentChatChannelSummaries = useCallback(async () => {
    const summary = (
      await apolloClient
        .query({
          query: GetAgentChatInboxSummaryDocument,
          fetchPolicy: 'network-only',
        })
        .catch(() => undefined)
    )?.data?.agentChatInboxSummary;

    if (!isDefined(summary)) {
      return;
    }

    store.set(
      agentChatChannelSummariesState.atom,
      Object.fromEntries(
        summary.channels.map(({ channelId, openCount, hasUnreadOpen }) => [
          channelId,
          { openCount, hasUnreadOpen },
        ]),
      ),
    );
  }, [apolloClient, store]);

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

  return { refreshAgentChatChannels, refreshAgentChatChannelSummaries };
};
