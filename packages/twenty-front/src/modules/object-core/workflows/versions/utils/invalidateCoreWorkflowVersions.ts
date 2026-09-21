import { type ApolloClient } from '@apollo/client';

import {
  GetCoreWorkflowDocument,
  GetCoreWorkflowsDocument,
  GetCoreWorkflowsWithCurrentVersionsDocument,
  GetCoreWorkflowVersionDocument,
  GetCoreWorkflowVersionsDocument,
} from '~/generated/graphql';

export const invalidateCoreWorkflowVersions = async (
  apolloCoreClient: ApolloClient,
) => {
  await apolloCoreClient.refetchQueries({
    optimistic: true,
    updateCache: (cache) => {
      for (const fieldName of [
        'coreWorkflowById',
        'coreWorkflowVersionById',
        'coreWorkflowVersionsByCoreWorkflowId',
        'coreWorkflows',
        'coreWorkflowsWithCurrentVersions',
      ]) {
        cache.evict({ id: 'ROOT_QUERY', fieldName });
      }
    },
    include: [
      GetCoreWorkflowVersionsDocument,
      GetCoreWorkflowVersionDocument,
      GetCoreWorkflowDocument,
      GetCoreWorkflowsDocument,
      GetCoreWorkflowsWithCurrentVersionsDocument,
    ],
    onQueryUpdated: (query) => query.options.fetchPolicy !== 'standby',
  });
};
