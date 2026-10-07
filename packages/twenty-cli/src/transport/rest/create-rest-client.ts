import { RestApiClient } from 'twenty-client-sdk/rest';

import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createHttpStatusError } from '@/transport/create-http-status-error';
import { createTargetFetch } from '@/transport/create-target-fetch';
import { parseResponseBody } from '@/transport/parse-response-body';

export const createRestClient = ({
  target,
  signal,
}: {
  target: ResolvedTarget;
  signal: AbortSignal;
}) => {
  const targetFetch = createTargetFetch({ target, signal });
  const fetchValidRestResponse: typeof fetch = async (input, init) => {
    const response = await targetFetch(input, init);

    if (!response.ok) {
      throw createHttpStatusError({
        status: response.status,
        headers: response.headers,
        body: await parseResponseBody(response),
        target,
      });
    }

    return response;
  };

  return new RestApiClient({
    baseUrl: target.apiUrl,
    token: target.bearerToken,
    fetch: fetchValidRestResponse,
    defaultHeaders: { Accept: 'application/json' },
  });
};
