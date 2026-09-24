import { type ApolloClient } from '@apollo/client';

import { invalidateCoreWorkflowQueries } from '@/object-core/workflows/utils/invalidateCoreWorkflowQueries';

export const invalidateCoreWorkflowVersions = async (
  apolloCoreClient: ApolloClient,
) => {
  await invalidateCoreWorkflowQueries(apolloCoreClient, {
    shouldInvalidateWorkflowList: false,
  });
};
