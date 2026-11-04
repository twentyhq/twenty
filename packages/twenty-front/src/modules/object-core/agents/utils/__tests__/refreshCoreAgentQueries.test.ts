import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { waitFor } from '@testing-library/react';
import { Observable } from 'rxjs';

import { refreshCoreAgentQueries } from '@/object-core/agents/utils/refreshCoreAgentQueries';
import { FindManyAgentsDocument } from '~/generated-metadata/graphql';

const createAgentQueryClient = () => {
  const completeRequests: (() => void)[] = [];
  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      () =>
        new Observable((observer) => {
          completeRequests.push(() => {
            observer.next({ data: { findManyAgents: [] } });
            observer.complete();
          });
        }),
    ),
  });
  apolloClient.writeQuery({
    query: FindManyAgentsDocument,
    data: { findManyAgents: [] },
  });
  const query = apolloClient.watchQuery({
    query: FindManyAgentsDocument,
    fetchPolicy: 'cache-first',
  });
  const subscription = query.subscribe({});

  return {
    apolloClient,
    completeRequests,
    close: () => {
      subscription.unsubscribe();
      apolloClient.stop();
    },
  };
};

it('shares a trailing refresh across callers and permits another refresh after completion', async () => {
  const client = createAgentQueryClient();

  try {
    const eventRefresh = refreshCoreAgentQueries(client);
    await waitFor(() => expect(client.completeRequests).toHaveLength(1));

    const deletionRefresh = refreshCoreAgentQueries(client);
    const reconnectRefresh = refreshCoreAgentQueries(client);
    client.completeRequests[0]();
    await waitFor(() => expect(client.completeRequests).toHaveLength(2));
    client.completeRequests[1]();

    await Promise.all([eventRefresh, deletionRefresh, reconnectRefresh]);
    expect(
      client.apolloClient.readQuery({ query: FindManyAgentsDocument }),
    ).toEqual({ findManyAgents: [] });

    const subsequentRefresh = refreshCoreAgentQueries(client);
    await waitFor(() => expect(client.completeRequests).toHaveLength(3));
    client.completeRequests[2]();
    await subsequentRefresh;
  } finally {
    client.close();
  }
});

it('keeps different Apollo clients independent while one refresh remains pending', async () => {
  const firstClient = createAgentQueryClient();
  const secondClient = createAgentQueryClient();

  try {
    const firstRefresh = refreshCoreAgentQueries(firstClient);
    const secondRefresh = refreshCoreAgentQueries(secondClient);
    await waitFor(() => {
      expect(firstClient.completeRequests).toHaveLength(1);
      expect(secondClient.completeRequests).toHaveLength(1);
    });

    secondClient.completeRequests[0]();
    await secondRefresh;
    firstClient.completeRequests[0]();
    await firstRefresh;
  } finally {
    firstClient.close();
    secondClient.close();
  }
});
