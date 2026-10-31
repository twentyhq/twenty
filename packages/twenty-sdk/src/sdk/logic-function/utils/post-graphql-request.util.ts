import { getApplicationApiConfigOrThrow } from '@/sdk/logic-function/utils/get-application-api-config-or-throw.util';

export const postGraphqlRequest = async <TVariables, TData>({
  query,
  variables,
  caller,
}: {
  query: string;
  variables: TVariables;
  caller: string;
}): Promise<TData> => {
  const { apiUrl, accessToken } = getApplicationApiConfigOrThrow(caller);

  const response = await fetch(`${apiUrl}/metadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `${caller}() failed: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const body = (await response.json()) as {
    data?: TData;
    errors?: { message: string }[];
  };

  if (body.errors && body.errors.length > 0) {
    throw new Error(
      `${caller}() failed: ${body.errors.map((error) => error.message).join(', ')}`,
    );
  }

  if (!body.data) {
    throw new Error(`${caller}() failed: response contained no data.`);
  }

  return body.data;
};
