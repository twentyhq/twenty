import { type ApolloClient } from '@apollo/client';

import { GET_WORKFLOW_VERSION_CONTENT } from '@/workflow/workflow-version/graphql/queries/getWorkflowVersionContent';
import {
  GetCoreWorkflowDocument,
  GetCoreWorkflowsDocument,
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
    'coreWorkflow',
    'coreWorkflowVersion',
    'coreWorkflowVersions',
    'workflowVersionContent',
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
      ...(shouldInvalidateWorkflowList ? [GetCoreWorkflowsDocument] : []),
    ],
    onQueryUpdated: (query) => query.options.fetchPolicy !== 'standby',
  });
};
