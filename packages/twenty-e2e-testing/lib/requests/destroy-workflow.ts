import { type Page } from '@playwright/test';
import { postBackendGraphQL } from './post-backend-graphql';

export const destroyWorkflow = async ({
  page,
  workflowId,
}: {
  page: Page;
  workflowId: string;
}) => {
  return postBackendGraphQL({
    page,
    data: {
      operationName: 'DestroyOneWorkflow',
      variables: { idToDestroy: workflowId },
      query:
        'mutation DestroyOneWorkflow($idToDestroy: UUID!) {\n  destroyWorkflow(id: $idToDestroy) {\n    id\n    __typename\n  }\n}',
    },
  });
};
