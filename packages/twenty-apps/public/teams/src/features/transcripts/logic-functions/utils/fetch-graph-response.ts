import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { GRAPH_REQUEST_MAX_ATTEMPTS } from 'src/features/transcripts/logic-functions/constants/graph-request-max-attempts';
import { GRAPH_REQUEST_RETRY_BASE_DELAY_MILLISECONDS } from 'src/features/transcripts/logic-functions/constants/graph-request-retry-base-delay-milliseconds';
import { GRAPH_RETRYABLE_STATUSES } from 'src/features/transcripts/logic-functions/constants/graph-retryable-statuses';
import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { type GraphRequestMethod } from 'src/features/transcripts/logic-functions/types/graph-request-method.type';
import { resolveGraphUrlOrThrow } from 'src/features/transcripts/logic-functions/utils/resolve-graph-url-or-throw';
import { fetchWithRetries } from 'src/utils/fetch-with-retries';

type GraphErrorBody = {
  error?: {
    message?: unknown;
    innerError?: { code?: unknown } | null;
  };
};

type GraphRequest = {
  accessToken: string;
  url: string;
  accept: string;
  method?: GraphRequestMethod;
  body?: object;
};

export const fetchGraphResponse = async ({
  accessToken,
  url,
  accept,
  method,
  body,
}: GraphRequest): Promise<Response> => {
  const resolvedUrl = resolveGraphUrlOrThrow(url);

  const response = await fetchWithRetries({
    sendRequest: () =>
      fetch(resolvedUrl, {
        method,
        redirect: 'error',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: accept,
          ...(isDefined(body) ? { 'Content-Type': 'application/json' } : {}),
        },
        body: isDefined(body) ? JSON.stringify(body) : undefined,
      }),
    maxAttempts: GRAPH_REQUEST_MAX_ATTEMPTS,
    isRetryableStatus: (status) => GRAPH_RETRYABLE_STATUSES.has(status),
    getRetryDelayMs: ({ attempt, retryAfterMs }) =>
      isDefined(retryAfterMs) && retryAfterMs > 0
        ? retryAfterMs
        : GRAPH_REQUEST_RETRY_BASE_DELAY_MILLISECONDS * 2 ** attempt,
  });

  if (response.ok) {
    return response;
  }

  const errorBody: GraphErrorBody = await response.json().catch(() => ({}));
  const innerErrorCode = isNonEmptyString(errorBody.error?.innerError?.code)
    ? errorBody.error.innerError.code
    : undefined;
  const message = isNonEmptyString(errorBody.error?.message)
    ? errorBody.error.message
    : response.statusText;

  throw new GraphRequestError({
    message: `Microsoft Graph request failed (${response.status}${isNonEmptyString(innerErrorCode) ? ` ${innerErrorCode}` : ''}): ${message}`,
    status: response.status,
    innerErrorCode,
  });
};
