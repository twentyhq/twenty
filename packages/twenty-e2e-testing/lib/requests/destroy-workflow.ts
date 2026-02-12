import { type Page } from '@playwright/test';
import { getAccessAuthToken } from '../utils/getAccessAuthToken';
import { backendGraphQLUrl } from './backend';

export const destroyWorkflow = async ({
  page,
  workflowId,
}: {
  page: Page;
  workflowId: string;
}) => {
  const { authToken } = await getAccessAuthToken(page);

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
