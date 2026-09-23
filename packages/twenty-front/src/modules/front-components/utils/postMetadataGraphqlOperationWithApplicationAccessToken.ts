import { type TypedDocumentNode } from '@apollo/client';
import { print } from 'graphql';

import { type MetadataGraphqlResponse } from '@/front-components/types/MetadataGraphqlResponse';
import { sendRequestWithOneRetryOnFailure } from '@/front-components/utils/sendRequestWithOneRetryOnFailure';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const postMetadataGraphqlOperationWithApplicationAccessToken = async <
  TData,
  TVariables extends Record<string, unknown>,
>({
  document,
  variables,
  applicationAccessToken,
}: {
  document: TypedDocumentNode<TData, TVariables>;
  variables: TVariables;
  applicationAccessToken: string;
}): Promise<MetadataGraphqlResponse<TData>> => {
  const response = await sendRequestWithOneRetryOnFailure(() =>
    fetch(`${REACT_APP_SERVER_BASE_URL}/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${applicationAccessToken}`,
      },
      body: JSON.stringify({ query: print(document), variables }),
      credentials: 'omit',
    }),
  );

  return {
    status: response.status,
    payload: await response.json().catch(() => null),
  };
};
