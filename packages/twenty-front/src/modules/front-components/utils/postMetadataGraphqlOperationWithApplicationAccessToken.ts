import { type DocumentNode, print } from 'graphql';

import { type MetadataGraphqlResponse } from '@/front-components/types/MetadataGraphqlResponse';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const postMetadataGraphqlOperationWithApplicationAccessToken = async <
  TData,
  TVariables extends Record<string, unknown>,
>({
  document,
  variables,
  applicationAccessToken,
}: {
  document: DocumentNode;
  variables: TVariables;
  applicationAccessToken: string;
}): Promise<MetadataGraphqlResponse<TData>> => {
  const response = await fetch(`${REACT_APP_SERVER_BASE_URL}/metadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${applicationAccessToken}`,
    },
    body: JSON.stringify({ query: print(document), variables }),
    credentials: 'omit',
  });

  return {
    status: response.status,
    payload: await response.json().catch(() => null),
  };
};
