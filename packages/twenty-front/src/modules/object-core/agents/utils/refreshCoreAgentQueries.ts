import { type ApolloClient } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';

import { createCoreAgentRefreshQueue } from '@/object-core/agents/utils/createCoreAgentRefreshQueue';
import { FindManyAgentsDocument } from '~/generated-metadata/graphql';

const refreshQueuesByClient = new WeakMap<
  ApolloClient,
  ReturnType<typeof createCoreAgentRefreshQueue>
>();

export const refreshCoreAgentQueries = (
  apolloClient: ApolloClient,
): Promise<void> => {
  const existingRefreshQueue = refreshQueuesByClient.get(apolloClient);

  if (isDefined(existingRefreshQueue)) {
    return existingRefreshQueue();
  }

  const refreshQueue = createCoreAgentRefreshQueue(async () => {
    await apolloClient.refetchQueries({
      include: [FindManyAgentsDocument],
      onQueryUpdated: (query) => query.options.fetchPolicy !== 'standby',
    });
  });

  refreshQueuesByClient.set(apolloClient, refreshQueue);

  return refreshQueue();
};
