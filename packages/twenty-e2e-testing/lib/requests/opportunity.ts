import { type Page } from '@playwright/test';
import { getAccessAuthToken } from '../utils/getAccessAuthToken';
import { backendGraphQLUrl } from './backend';

export const createOpportunity = async ({
  page,
  fields,
}: {
  page: Page;
  fields: Record<string, unknown>;
}): Promise<string> => {
  const { authToken } = await getAccessAuthToken(page);

  const response = await page.request.post(backendGraphQLUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: {
      operationName: 'CreateOneOpportunity',
      query:
        'mutation CreateOneOpportunity($input: OpportunityCreateInput!) { createOpportunity(data: $input) { id } }',
      variables: {
        input: {
          name: '__e2e_test__',
          ...fields,
        },
      },
    },
  });

  const body = await response.json();
  if (!body.data?.createOpportunity) {
    throw new Error(`createOpportunity mutation failed: ${JSON.stringify(body)}`);
  }
  return body.data.createOpportunity.id;
};

export const updateOpportunity = async ({
  page,
  id,
  fields,
}: {
  page: Page;
  id: string;
  fields: Record<string, unknown>;
}): Promise<void> => {
  const { authToken } = await getAccessAuthToken(page);

  const response = await page.request.post(backendGraphQLUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: {
      operationName: 'UpdateOneOpportunity',
      query:
        'mutation UpdateOneOpportunity($id: UUID!, $input: OpportunityUpdateInput!) { updateOpportunity(id: $id, data: $input) { id } }',
      variables: { id, input: fields },
    },
  });

  const body = await response.json();
  if (body.errors?.length) {
    throw new Error(`updateOpportunity mutation failed: ${JSON.stringify(body.errors)}`);
  }
};

export const deleteOpportunity = async ({
  page,
  id,
}: {
  page: Page;
  id: string;
}): Promise<void> => {
  const { authToken } = await getAccessAuthToken(page);

  await page.request.post(backendGraphQLUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: {
      operationName: 'DeleteOneOpportunity',
      query:
        'mutation DeleteOneOpportunity($id: UUID!) { deleteOpportunity(id: $id) { id } }',
      variables: { id },
    },
  });
};
