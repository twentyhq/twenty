import { Page } from '@playwright/test';
import { getAuthToken } from '../utils/getAuthToken';
import { backendGraphQLUrl } from './backend';

export const destroyWorkflow = async ({
  page,
  workflowId,
}: {
  page: Page;
  workflowId: string;
}) => {
  const { authToken } = await getAuthToken(page);

  return page.request.post(backendGraphQLUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: {
      operationName: 'DestroyOneWorkflow',
      variables: { idToDestroy: workflowId },
      query:
        'mutation DestroyOneWorkflow($idToDestroy: UUID!) {\n  destroyWorkflow(id: $idToDestroy) {\n    id\n    __typename\n  }\n}',
    },
  });
};
