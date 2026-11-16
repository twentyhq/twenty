import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { inboxChannelSummariesState } from '@/inbox/states/inboxChannelSummariesState';
import { GetAgentChatChannelSummariesDocument } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useRefreshInboxChannelSummaries = () => {
  const apolloClient = useApolloClient();
  const store = useStore();

  const refreshInboxChannelSummaries = useCallback(async () => {
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
      summaries.map(({ channelId, ...summary }) => [channelId, summary]),
    );

    // Most chat changes leave the counts as they were
    if (
      !isDeeplyEqual(
        store.get(inboxChannelSummariesState.atom),
        summariesByChannelId,
      )
    ) {
      store.set(inboxChannelSummariesState.atom, summariesByChannelId);
    }
  }, [apolloClient, store]);

  return { refreshInboxChannelSummaries };
};
