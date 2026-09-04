import { type ApolloClient } from '@apollo/client';

import { GetCoreWorkflowVersionsDocument } from '~/generated/graphql';

export const invalidateCoreWorkflowVersions = async (
  apolloCoreClient: ApolloClient,
) => {
  apolloCoreClient.cache.evict({
    id: 'ROOT_QUERY',
    fieldName: 'coreWorkflowVersions',
  });
  await apolloCoreClient.refetchQueries({
    include: [GetCoreWorkflowVersionsDocument],
  });
};
