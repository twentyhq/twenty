import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useRefreshInboxChannelSummaries } from '@/inbox/hooks/useRefreshInboxChannelSummaries';
import { INBOX_DEFAULT_SELECTED_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxDefaultSelectedThreadListSource';
import { aiChatChannelsState } from '@/ai/states/aiChatChannelsState';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { isInboxSelectedThreadListSourceAccessible } from '@/inbox/utils/isInboxSelectedThreadListSourceAccessible';
import { GetAgentChatChannelsDocument } from '~/generated-metadata/graphql';

// A failed load keeps what was shown, as the next change loads again
export const useRefreshInboxChannels = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { refreshInboxChannelSummaries } = useRefreshInboxChannelSummaries();

  const refreshInboxChannels = useCallback(async () => {
    const [channelsResult] = await Promise.all([
      apolloClient
        .query({
          query: GetAgentChatChannelsDocument,
          fetchPolicy: 'network-only',
        })
        .catch(() => undefined),
      refreshInboxChannelSummaries(),
    ]);

    const channels = channelsResult?.data?.agentChatChannels;

    if (!isDefined(channels)) {
      return;
    }

    store.set(aiChatChannelsState.atom, channels);

    if (
      !isInboxSelectedThreadListSourceAccessible({
        source: store.get(inboxSelectedThreadListSourceState.atom),
        channels,
      })
    ) {
      store.set(
        inboxSelectedThreadListSourceState.atom,
        INBOX_DEFAULT_SELECTED_THREAD_LIST_SOURCE,
      );
    }
  }, [apolloClient, refreshInboxChannelSummaries, store]);

  return { refreshInboxChannels };
};
