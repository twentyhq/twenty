import {
  DEFAULT_API_URL_NAME,
  DEFAULT_APP_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application';

export const postGraphqlRequest = async <TVariables, TData>({
  query,
  variables,
  caller,
}: {
  query: string;
  variables: TVariables;
  caller: string;
}): Promise<TData> => {
  const apiUrl = process.env[DEFAULT_API_URL_NAME];
  const accessToken = process.env[DEFAULT_APP_ACCESS_TOKEN_NAME];

  if (!apiUrl || !accessToken) {
    throw new Error(
      `${caller}() requires the app runtime env vars ` +
        `${DEFAULT_API_URL_NAME} and ${DEFAULT_APP_ACCESS_TOKEN_NAME}.`,
    );
  }

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
