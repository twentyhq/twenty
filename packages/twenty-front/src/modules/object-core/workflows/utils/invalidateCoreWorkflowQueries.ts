import { type ApolloClient } from '@apollo/client';

import {
  GetCoreWorkflowDocument,
  GetCoreWorkflowsDocument,
  GetCoreWorkflowsWithCurrentVersionsDocument,
  GetCoreWorkflowVersionDocument,
  GetCoreWorkflowVersionsDocument,
} from '~/generated/graphql';

export const invalidateCoreWorkflowQueries = async (
  apolloCoreClient: ApolloClient,
  {
    shouldInvalidateWorkflowList = true,
  }: { shouldInvalidateWorkflowList?: boolean } = {},
) => {
  const fieldNames = [
    'coreWorkflowById',
    'coreWorkflowVersionById',
    'coreWorkflowVersionsByCoreWorkflowId',
    // The command menu reads this one to decide which workflow actions to offer,
    // so a version change has to refresh it even when the list is left alone.
    'coreWorkflowsWithCurrentVersions',
    ...(shouldInvalidateWorkflowList ? ['coreWorkflows'] : []),
  ];

  for (const fieldName of fieldNames) {
    apolloCoreClient.cache.evict({ id: 'ROOT_QUERY', fieldName });
  }

  await apolloCoreClient.refetchQueries({
    include: [
      GetCoreWorkflowVersionsDocument,
      GetCoreWorkflowVersionDocument,
      GetCoreWorkflowDocument,
      GetCoreWorkflowsWithCurrentVersionsDocument,
      ...(shouldInvalidateWorkflowList ? [GetCoreWorkflowsDocument] : []),
    ],
    onQueryUpdated: (query) => query.options.fetchPolicy !== 'standby',
  });
};
