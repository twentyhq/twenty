import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import {
  GRAPH_REQUEST_MAX_ATTEMPTS,
  GRAPH_REQUEST_RETRY_BASE_DELAY_MILLISECONDS,
  GRAPH_REQUEST_RETRY_MAX_DELAY_MILLISECONDS,
  MICROSOFT_GRAPH_BASE_URL,
} from 'src/constants/teams.constant';
import { GraphRequestError } from 'src/logic-functions/utils/graph-request-error';

type GraphErrorBody = {
  error?: {
    code?: unknown;
    message?: unknown;
    innerError?: { code?: unknown } | null;
  };
};

type GraphFetchInput = {
  accessToken: string;
  url: string;
  accept?: string;
};

const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const readRetryAfterMilliseconds = (
  response: Response,
  attempt: number,
): number => {
  const retryAfterSeconds = Number(response.headers.get('Retry-After'));
  const backoff = isNumber(retryAfterSeconds) && retryAfterSeconds > 0
    ? retryAfterSeconds * 1_000
    : GRAPH_REQUEST_RETRY_BASE_DELAY_MILLISECONDS * 2 ** attempt;

  return Math.min(backoff, GRAPH_REQUEST_RETRY_MAX_DELAY_MILLISECONDS);
};

const buildGraphRequestError = async (
  response: Response,
): Promise<GraphRequestError> => {
  const body = (await response.json().catch(() => ({}))) as GraphErrorBody;
  const errorCode = isNonEmptyString(body.error?.code)
    ? body.error.code
    : undefined;
  const innerErrorCode = isNonEmptyString(body.error?.innerError?.code)
    ? body.error.innerError.code
    : undefined;
  const message = isNonEmptyString(body.error?.message)
    ? body.error.message
    : response.statusText;

  return new GraphRequestError(
    `Microsoft Graph request failed (${response.status}${isNonEmptyString(innerErrorCode) ? ` ${innerErrorCode}` : ''}): ${message}`,
    response.status,
    errorCode,
    innerErrorCode,
  );
};

export const resolveGraphUrl = (url: string): string =>
  url.startsWith('https://') ? url : `${MICROSOFT_GRAPH_BASE_URL}/${url.replace(/^\/+/, '')}`;

// Graph throttles per app and per tenant; the Retry-After header is the
// authoritative wait, the exponential backoff only covers responses without it.
export const graphFetch = async ({
  accessToken,
  url,
  accept,
}: GraphFetchInput): Promise<Response> => {
  const resolvedUrl = resolveGraphUrl(url);

  for (let attempt = 0; attempt < GRAPH_REQUEST_MAX_ATTEMPTS; attempt++) {
    const response = await fetch(resolvedUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(isNonEmptyString(accept) ? { Accept: accept } : {}),
      },
    });

    if (response.ok) {
      return response;
    }

    const isLastAttempt = attempt + 1 >= GRAPH_REQUEST_MAX_ATTEMPTS;

    if (!RETRYABLE_STATUSES.has(response.status)) {
      throw await buildGraphRequestError(response);
    }

    if (isLastAttempt) {
      const error = await buildGraphRequestError(response);

      throw new RetryableLogicFunctionError(error.message);
    }

    await sleep(readRetryAfterMilliseconds(response, attempt));
  }

  throw new RetryableLogicFunctionError(
    `Microsoft Graph request to ${resolvedUrl} exhausted its attempts`,
  );
};

export const graphFetchJson = async <TResponse>(
  input: GraphFetchInput,
): Promise<TResponse> => {
  const response = await graphFetch({ ...input, accept: 'application/json' });

  return (await response.json()) as TResponse;
};

export const graphFetchText = async (input: GraphFetchInput): Promise<string> =>
  (await graphFetch(input)).text();
