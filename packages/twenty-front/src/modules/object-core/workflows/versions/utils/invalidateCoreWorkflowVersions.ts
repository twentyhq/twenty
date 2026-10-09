import { type ApolloClient } from '@apollo/client';

import { invalidateCoreWorkflowQueries } from '@/object-core/workflows/utils/invalidateCoreWorkflowQueries';

export const invalidateCoreWorkflowVersions = async (
  apolloCoreClient: ApolloClient,
  { deletedWorkflowVersionId }: { deletedWorkflowVersionId?: string } = {},
) => {
  await invalidateCoreWorkflowQueries(apolloCoreClient, {
    shouldInvalidateWorkflowList: false,
    deletedWorkflowVersionId,
  });
};
