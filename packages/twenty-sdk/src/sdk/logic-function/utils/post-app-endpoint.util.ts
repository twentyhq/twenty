import {
  DEFAULT_API_URL_NAME,
  DEFAULT_APP_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application';

export const postAppEndpoint = async <TBody, TResponse>({
  path,
  body,
  caller,
}: {
  path: string;
  body: TBody;
  caller: string;
}): Promise<TResponse> => {
  const apiUrl = process.env[DEFAULT_API_URL_NAME];
  const accessToken = process.env[DEFAULT_APP_ACCESS_TOKEN_NAME];

  if (!apiUrl || !accessToken) {
    throw new Error(
      `${caller}() requires the app runtime env vars ` +
        `${DEFAULT_API_URL_NAME} and ${DEFAULT_APP_ACCESS_TOKEN_NAME}.`,
    );
  }

  const response = await fetch(`${apiUrl}/apps/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `${caller}() failed: HTTP ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as TResponse;
};
