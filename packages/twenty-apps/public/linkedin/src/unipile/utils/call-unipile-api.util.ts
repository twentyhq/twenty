import { UNIPILE_API_BASE_URL } from 'src/unipile/constants/unipile-api-base-url.constant';
import { getUnipileApiKeyOrThrow } from 'src/unipile/utils/get-unipile-api-key-or-throw.util';
import { UnipileApiError } from 'src/unipile/utils/unipile-api-error.util';

export const callUnipileApi = async <TResponse>({
  method,
  path,
  body,
}: {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  body?: object;
}): Promise<TResponse> => {
  const response = await fetch(`${UNIPILE_API_BASE_URL}${path}`, {
    method,
    headers: {
      'X-API-KEY': getUnipileApiKeyOrThrow(),
      accept: 'application/json',
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new UnipileApiError(response.status, path, await response.text());
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
};
