import { isNonEmptyString } from '@sniptt/guards';

import {
  GRAPH_REQUEST_MAX_ATTEMPTS,
  GRAPH_REQUEST_RETRY_BASE_DELAY_MILLISECONDS,
  MICROSOFT_GRAPH_BASE_URL,
} from 'src/constants/teams.constant';
import { GraphRequestError } from 'src/logic-functions/types/graph-request-error';

type GraphErrorBody = {
  error?: {
    code?: unknown;
    message?: unknown;
    innerError?: { code?: unknown } | null;
  };
};

type GraphFetchJsonInput = {
  accessToken: string;
  url: string;
};

const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const resolveGraphUrl = (url: string): string => {
  const resolvedUrl = new URL(url, `${MICROSOFT_GRAPH_BASE_URL}/`);

  if (resolvedUrl.origin !== new URL(MICROSOFT_GRAPH_BASE_URL).origin) {
    throw new Error('Microsoft Graph URLs must use graph.microsoft.com');
  }

  return resolvedUrl.toString();
};

const readRetryAfterMilliseconds = (
  response: Response,
  attempt: number,
): number => {
  const retryAfterSeconds = Number(response.headers.get('Retry-After'));

  return retryAfterSeconds > 0
    ? retryAfterSeconds * 1_000
    : GRAPH_REQUEST_RETRY_BASE_DELAY_MILLISECONDS * 2 ** attempt;
};

const buildGraphRequestError = async (
  response: Response,
): Promise<GraphRequestError> => {
  const body: GraphErrorBody = await response.json().catch(() => ({}));
  const errorCode = isNonEmptyString(body.error?.code)
    ? body.error.code
    : undefined;
  const innerErrorCode = isNonEmptyString(body.error?.innerError?.code)
    ? body.error.innerError.code
    : undefined;
  const message = isNonEmptyString(body.error?.message)
    ? body.error.message
    : response.statusText;

  return new GraphRequestError({
    message: `Microsoft Graph request failed (${response.status}${isNonEmptyString(innerErrorCode) ? ` ${innerErrorCode}` : ''}): ${message}`,
    status: response.status,
    errorCode,
    innerErrorCode,
  });
};

const fetchWithRetry = async ({
  accessToken,
  resolvedUrl,
  attempt,
}: {
  accessToken: string;
  resolvedUrl: string;
  attempt: number;
}): Promise<Response> => {
  const response = await fetch(resolvedUrl, {
    redirect: 'error',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (response.ok) {
    return response;
  }

  const canRetry =
    RETRYABLE_STATUSES.has(response.status) &&
    attempt + 1 < GRAPH_REQUEST_MAX_ATTEMPTS;

  if (!canRetry) {
    throw await buildGraphRequestError(response);
  }

  await sleep(readRetryAfterMilliseconds(response, attempt));

  return fetchWithRetry({ accessToken, resolvedUrl, attempt: attempt + 1 });
};

export const graphFetchJson = async <TResponse>({
  accessToken,
  url,
}: GraphFetchJsonInput): Promise<TResponse> => {
  const response = await fetchWithRetry({
    accessToken,
    resolvedUrl: resolveGraphUrl(url),
    attempt: 0,
  });

  const body: TResponse = await response.json();

  return body;
};
