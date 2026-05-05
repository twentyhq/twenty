import { type Page } from '@playwright/test';
import { getAccessAuthToken } from '../utils/getAccessAuthToken';
import { backendGraphQLUrl } from './backend';

export const createCompany = async ({
  page,
  companyName,
}: {
  page: Page;
  companyName: string;
}) => {
  const { authToken } = await getAccessAuthToken(page);

  const response = await page.request.post(backendGraphQLUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    data: {
      operationName: 'CreateOneCompany',
      query:
        'mutation CreateOneCompany($input: CompanyCreateInput!) { createCompany(data: $input) { __typename id } }',
      variables: {
        input: {
          name: companyName,
        },
      },
    },
  });

  if (!response.ok()) {
    throw new Error(
      `createCompany request failed with status ${response.status()}`,
    );
  }

  const body = await response.json();

  if (body.errors?.length) {
    throw new Error(
      `createCompany GraphQL errors: ${body.errors.map((e: { message: string }) => e.message).join(', ')}`,
    );
  }

  const id: string | undefined = body.data?.createCompany?.id;

  if (!id) {
    throw new Error('createCompany returned no id');
  }

  return id;
};
