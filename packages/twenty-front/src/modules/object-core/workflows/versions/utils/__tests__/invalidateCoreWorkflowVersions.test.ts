import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';

import { invalidateCoreWorkflowVersions } from '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions';
import { GetCoreWorkflowDocument } from '~/generated/graphql';

describe('invalidateCoreWorkflowVersions', () => {
  it('refreshes active definitions without executing skipped queries with empty IDs', async () => {
    const requestedIds: string[] = [];
    let name = 'Initial name';
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            requestedIds.push(operation.variables.coreWorkflowId);
            const timeout = setTimeout(() => {
              observer.next({
                data: {
                  coreWorkflow: {
                    id: operation.variables.coreWorkflowId,
                    name,
                    statuses: ['DRAFT'],
                    lastPublishedCoreWorkflowVersionId: null,
                    workspaceWorkflowId: null,
                    createdAt: '2026-09-17T00:00:00Z',
                    updatedAt: '2026-09-17T00:00:00Z',
                  },
                },
              });
              observer.complete();
            }, 0);
            return () => clearTimeout(timeout);
          }),
      ),
    });
    const variables = {
      coreWorkflowId: '8c9a3708-5674-4e1b-a9b9-4f0dacb26c15',
    };
    await client.query({ query: GetCoreWorkflowDocument, variables });
    const activeQuery = client.watchQuery({
      query: GetCoreWorkflowDocument,
      variables,
    });
    const skippedQuery = client.watchQuery({
      query: GetCoreWorkflowDocument,
      variables: { coreWorkflowId: '' },
      fetchPolicy: 'standby',
    });
    const activeSubscription = activeQuery.subscribe({});
    const skippedSubscription = skippedQuery.subscribe({});
    requestedIds.length = 0;
    name = 'Updated name';

    await invalidateCoreWorkflowVersions(client);

    expect(requestedIds).toEqual([variables.coreWorkflowId]);
    expect(activeQuery.getCurrentResult().data?.coreWorkflow?.name).toBe(
      'Updated name',
    );
    activeSubscription.unsubscribe();
    skippedSubscription.unsubscribe();
    client.stop();
  });
});
