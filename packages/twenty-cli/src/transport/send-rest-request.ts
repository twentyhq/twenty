import { isDefined } from 'twenty-shared/utils';

import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createHttpStatusError } from '@/transport/create-http-status-error';
import { createTargetFetch } from '@/transport/create-target-fetch';
import { parseResponseBody } from '@/transport/parse-response-body';
import { pickSafeResponseHeaders } from '@/transport/pick-safe-response-headers';
import { resolveRequestUrl } from '@/transport/resolve-request-url';

export const sendRestRequest = async ({
  target,
  signal,
  method,
  path,
  body,
}: {
  target: ResolvedTarget;
  signal: AbortSignal;
  method: string;
  path: string;
  body?: string;
}) => {
  const response = await createTargetFetch({ target, signal })(
    resolveRequestUrl({ apiUrl: target.apiUrl, path }),
    {
      method,
      headers: {
        Accept: 'application/json',
        ...(isDefined(body) ? { 'Content-Type': 'application/json' } : {}),
      },
      body,
    },
  );
  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw createHttpStatusError({
      status: response.status,
      headers: response.headers,
      body: responseBody,
      target,
    });
  }

  return {
    status: response.status,
    headers: pickSafeResponseHeaders(response.headers),
    body: responseBody,
  };
};
