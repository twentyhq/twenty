import { type ApolloClient } from '@apollo/client';

import { GET_WORKFLOW_VERSION_CONTENT } from '@/workflow/workflow-version/graphql/queries/getWorkflowVersionContent';
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
    'workflowVersionContent',
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
      GET_WORKFLOW_VERSION_CONTENT,
      GetCoreWorkflowsWithCurrentVersionsDocument,
      ...(shouldInvalidateWorkflowList ? [GetCoreWorkflowsDocument] : []),
    ],
    onQueryUpdated: (query) => query.options.fetchPolicy !== 'standby',
  });
};
