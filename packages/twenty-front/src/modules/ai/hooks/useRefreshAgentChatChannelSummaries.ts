import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
import { GetAgentChatChannelSummariesDocument } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useRefreshAgentChatChannelSummaries = () => {
  const apolloClient = useApolloClient();
  const store = useStore();

  const refreshAgentChatChannelSummaries = useCallback(async () => {
    const summaries = (
      await apolloClient
        .query({
          query: GetAgentChatChannelSummariesDocument,
          fetchPolicy: 'network-only',
        })
        .catch(() => undefined)
    )?.data?.agentChatChannelSummaries;

    if (!isDefined(summaries)) {
      return;
    }

    const summariesByChannelId = Object.fromEntries(
      summaries.map(({ channelId, openCount, hasUnreadOpen }) => [
        channelId,
        { openCount, hasUnreadOpen },
      ]),
    );

    // Most chat changes leave the counts as they were
    if (
      !isDeeplyEqual(
        store.get(agentChatChannelSummariesState.atom),
        summariesByChannelId,
      )
    ) {
      store.set(agentChatChannelSummariesState.atom, summariesByChannelId);
    }
  }, [apolloClient, store]);

  return { refreshAgentChatChannelSummaries };
};
