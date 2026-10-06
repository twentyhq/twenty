import { isNonEmptyString } from '@sniptt/guards';

import { GRAPH_REQUEST_MAX_ATTEMPTS } from 'src/features/transcripts/logic-functions/constants/graph-request-max-attempts';
import { GRAPH_REQUEST_RETRY_BASE_DELAY_MILLISECONDS } from 'src/features/transcripts/logic-functions/constants/graph-request-retry-base-delay-milliseconds';
import { GRAPH_RETRYABLE_STATUSES } from 'src/features/transcripts/logic-functions/constants/graph-retryable-statuses';
import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { resolveGraphUrlOrThrow } from 'src/features/transcripts/logic-functions/utils/resolve-graph-url-or-throw';
import { sleepForMilliseconds } from 'src/features/transcripts/logic-functions/utils/sleep-for-milliseconds';

type GraphErrorBody = {
  error?: {
    message?: unknown;
    innerError?: { code?: unknown } | null;
  };
};

const fetchGraphResponseWithRetries = async ({
  accessToken,
  url,
  accept,
  attempt,
}: {
  accessToken: string;
  url: string;
  accept: string;
  attempt: number;
}): Promise<Response> => {
  const response = await fetch(url, {
    redirect: 'error',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: accept,
    },
  });

  if (response.ok) {
    return response;
  }

  if (
    GRAPH_RETRYABLE_STATUSES.has(response.status) &&
    attempt + 1 < GRAPH_REQUEST_MAX_ATTEMPTS
  ) {
    const retryAfterSeconds = Number(response.headers.get('Retry-After'));

    await sleepForMilliseconds(
      retryAfterSeconds > 0
        ? retryAfterSeconds * 1_000
        : GRAPH_REQUEST_RETRY_BASE_DELAY_MILLISECONDS * 2 ** attempt,
    );

    return fetchGraphResponseWithRetries({
      accessToken,
      url,
      accept,
      attempt: attempt + 1,
    });
  }

  const body: GraphErrorBody = await response.json().catch(() => ({}));
  const innerErrorCode = isNonEmptyString(body.error?.innerError?.code)
    ? body.error.innerError.code
    : undefined;
  const message = isNonEmptyString(body.error?.message)
    ? body.error.message
    : response.statusText;

  throw new GraphRequestError({
    message: `Microsoft Graph request failed (${response.status}${isNonEmptyString(innerErrorCode) ? ` ${innerErrorCode}` : ''}): ${message}`,
    status: response.status,
    innerErrorCode,
  });
};

export const fetchGraphResponse = ({
  accessToken,
  url,
  accept,
}: {
  accessToken: string;
  url: string;
  accept: string;
}): Promise<Response> =>
  fetchGraphResponseWithRetries({
    accessToken,
    url: resolveGraphUrlOrThrow(url),
    accept,
    attempt: 0,
  });
