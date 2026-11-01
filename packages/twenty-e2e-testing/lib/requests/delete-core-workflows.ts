import { type Page } from '@playwright/test';
import { postBackendGraphQL } from './post-backend-graphql';

export const deleteCoreWorkflows = async ({
  page,
  coreWorkflowIds,
}: {
  page: Page;
  coreWorkflowIds: string[];
}) => {
  return postBackendGraphQL({
    page,
    data: {
      operationName: 'DeleteCoreWorkflows',
      variables: { input: { coreWorkflowIds } },
      query:
        'mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {\n  deleteCoreWorkflows(input: $input) {\n    id\n  }\n}',
    },
  });
};
