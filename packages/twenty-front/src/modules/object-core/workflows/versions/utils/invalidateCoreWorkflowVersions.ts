import { type ApolloClient } from '@apollo/client';

import {
  GetCoreWorkflowDocument,
  GetCoreWorkflowsDocument,
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
      ]) {
        cache.evict({ id: 'ROOT_QUERY', fieldName });
      }
    },
    include: [
      GetCoreWorkflowVersionsDocument,
      GetCoreWorkflowVersionDocument,
      GetCoreWorkflowDocument,
      GetCoreWorkflowsDocument,
    ],
  });
};
