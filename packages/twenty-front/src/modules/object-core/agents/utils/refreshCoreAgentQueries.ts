import { type ApolloClient } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';

import { createCoreAgentRefreshQueue } from '@/object-core/agents/utils/createCoreAgentRefreshQueue';
import {
  FindManyAgentsDocument,
  FindOneAgentDocument,
} from '~/generated-metadata/graphql';

const refreshQueuesByClient = new WeakMap<
  ApolloClient,
  Map<
    string | undefined,
    {
      refresh: ReturnType<typeof createCoreAgentRefreshQueue>;
      pendingRefresh?: Promise<void>;
    }
  >
>();

export const refreshCoreAgentQueries = async ({
  apolloClient,
  agentId,
}: {
  apolloClient: ApolloClient;
  agentId?: string;
}): Promise<void> => {
  let refreshQueues = refreshQueuesByClient.get(apolloClient);

  if (!isDefined(refreshQueues)) {
    refreshQueues = new Map();
    refreshQueuesByClient.set(apolloClient, refreshQueues);
  }

  let refreshQueue = refreshQueues.get(agentId);

  if (!isDefined(refreshQueue)) {
    refreshQueue = {
      refresh: createCoreAgentRefreshQueue(async () => {
        await apolloClient.refetchQueries({
          include: [
            isDefined(agentId) ? FindOneAgentDocument : FindManyAgentsDocument,
          ],
          onQueryUpdated: (query) =>
            query.options.fetchPolicy !== 'standby' &&
            (!isDefined(agentId) || query.variables.id === agentId),
        });
      }),
    };
    refreshQueues.set(agentId, refreshQueue);
  }

  const pendingRefresh = refreshQueue.refresh();
  refreshQueue.pendingRefresh = pendingRefresh;

  try {
    await pendingRefresh;
  } finally {
    if (refreshQueues.get(agentId)?.pendingRefresh === pendingRefresh) {
      refreshQueues.delete(agentId);
    }
  }
};
