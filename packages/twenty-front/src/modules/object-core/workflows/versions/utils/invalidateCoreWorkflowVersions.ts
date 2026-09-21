import { type ApolloClient } from '@apollo/client';

<<<<<<< HEAD
import { invalidateCoreWorkflowQueries } from '@/object-core/workflows/utils/invalidateCoreWorkflowQueries';
=======
import {
  GetCoreWorkflowDocument,
  GetCoreWorkflowsDocument,
  GetCoreWorkflowsWithCurrentVersionsDocument,
  GetCoreWorkflowVersionDocument,
  GetCoreWorkflowVersionsDocument,
} from '~/generated/graphql';
>>>>>>> tt-workflow-core-sse

export const invalidateCoreWorkflowVersions = async (
  apolloCoreClient: ApolloClient,
) => {
<<<<<<< HEAD
  await invalidateCoreWorkflowQueries(apolloCoreClient, {
    shouldInvalidateWorkflowList: false,
=======
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
>>>>>>> tt-workflow-core-sse
  });
};
