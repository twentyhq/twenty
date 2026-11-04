import { type ApolloClient } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';

import { createCoreAgentRefreshQueue } from '@/object-core/agents/utils/createCoreAgentRefreshQueue';
import { FindManyAgentsDocument } from '~/generated-metadata/graphql';

const refreshQueuesByClient = new WeakMap<
  ApolloClient,
  {
    refresh: ReturnType<typeof createCoreAgentRefreshQueue>;
    pendingRefresh?: Promise<void>;
  }
>();

export const refreshCoreAgentQueries = async (
  apolloClient: ApolloClient,
): Promise<void> => {
  let refreshQueue = refreshQueuesByClient.get(apolloClient);

  if (!isDefined(refreshQueue)) {
    refreshQueue = {
      refresh: createCoreAgentRefreshQueue(async () => {
        await apolloClient.refetchQueries({
          include: [FindManyAgentsDocument],
          onQueryUpdated: (query) => query.options.fetchPolicy !== 'standby',
        });
      }),
    };
    refreshQueuesByClient.set(apolloClient, refreshQueue);
  }

  const pendingRefresh = refreshQueue.refresh();
  refreshQueue.pendingRefresh = pendingRefresh;

  try {
    await pendingRefresh;
  } finally {
    if (
      refreshQueuesByClient.get(apolloClient)?.pendingRefresh === pendingRefresh
    ) {
      refreshQueuesByClient.delete(apolloClient);
    }
  }
};
