import { isDefined } from 'src/utils/is-defined';
import { sleepForMilliseconds } from 'src/utils/sleep-for-milliseconds.util';

import { FIREFLIES_API_MAX_ATTEMPTS } from 'src/logic-functions/constants/fireflies-api-max-attempts.constant';
import { FIREFLIES_API_REQUEST_TIMEOUT_MILLISECONDS } from 'src/logic-functions/constants/fireflies-api-request-timeout-milliseconds.constant';
import { FIREFLIES_API_RETRY_DELAY_MILLISECONDS } from 'src/logic-functions/constants/fireflies-api-retry-delay-milliseconds.constant';
import { isRetryableFirefliesApiStatus } from 'src/logic-functions/utils/is-retryable-fireflies-api-status.util';

const FIREFLIES_API_URL = 'https://api.fireflies.ai/graphql';

type FirefliesApiSuccess<TData> = {
  ok: true;
  status: number;
  data: TData;
};

type FirefliesApiFailure = {
  ok: false;
  status: number;
  errorMessage: string;
  isTimeout?: boolean;
};

export type FirefliesApiResult<TData> =
  | FirefliesApiSuccess<TData>
  | FirefliesApiFailure;

type FirefliesGraphqlError = {
  message?: string;
  extensions?: {
    code?: string;
  };
};

const HTTP_STATUS_BY_FIREFLIES_ERROR_CODE: Record<string, number> = {
  request_timeout: 408,
  too_many_requests: 429,
  invariant_violation: 500,
};

type FirefliesGraphqlEnvelope<TData> = {
  data?: TData;
  errors?: FirefliesGraphqlError[];
};

type FirefliesApiRequestParams = {
  accessToken: string;
  query: string;
  variables?: Record<string, unknown>;
};

export const firefliesApiRequest = async <TData = unknown>(
  params: FirefliesApiRequestParams,
): Promise<FirefliesApiResult<TData>> =>
  performFirefliesApiRequestWithRetries<TData>({ params, attemptNumber: 1 });

const performFirefliesApiRequestWithRetries = async <TData>({
  params,
  attemptNumber,
}: {
  params: FirefliesApiRequestParams;
  attemptNumber: number;
}): Promise<FirefliesApiResult<TData>> => {
  const result = await performFirefliesApiRequest<TData>(params);

  // Retrying a stalled request would exceed the interactive functions' 30s/60s budgets.
  if (
    result.ok ||
    result.isTimeout === true ||
    !isRetryableFirefliesApiStatus(result.status) ||
    attemptNumber >= FIREFLIES_API_MAX_ATTEMPTS
  ) {
    return result;
  }

  await sleepForMilliseconds(
    FIREFLIES_API_RETRY_DELAY_MILLISECONDS * attemptNumber,
  );

  return performFirefliesApiRequestWithRetries<TData>({
    params,
    attemptNumber: attemptNumber + 1,
  });
};

const performFirefliesApiRequest = async <TData = unknown>({
  accessToken,
  query,
  variables,
}: FirefliesApiRequestParams): Promise<FirefliesApiResult<TData>> => {
  const fetchResult = await fetch(FIREFLIES_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(FIREFLIES_API_REQUEST_TIMEOUT_MILLISECONDS),
  }).then(
    (response) => ({ ok: true as const, response }),
    (fetchError: unknown) => ({ ok: false as const, fetchError }),
  );

  if (!fetchResult.ok) {
    return {
      ok: false,
      status: 0,
      errorMessage: isTimeoutError(fetchResult.fetchError)
        ? buildFirefliesTimeoutMessage()
        : `Fireflies API request failed: ${(fetchResult.fetchError as Error).message}`,
      isTimeout: isTimeoutError(fetchResult.fetchError),
    };
  }

  const { response } = fetchResult;

  const parseResult = await response.json().then(
    (envelopeJson) => ({
      ok: true as const,
      envelope: envelopeJson as FirefliesGraphqlEnvelope<TData> | null,
    }),
    (parseError: unknown) => ({
      ok: false as const,
      parseError: parseError as Error,
    }),
  );

  // The timeout signal can also fire while the response body streams in.
  if (!parseResult.ok && isTimeoutError(parseResult.parseError)) {
    return {
      ok: false,
      status: 0,
      errorMessage: buildFirefliesTimeoutMessage(),
      isTimeout: true,
    };
  }

  const envelope = parseResult.ok ? parseResult.envelope : null;

  if (
    envelope !== null &&
    isDefined(envelope.errors) &&
    envelope.errors.length > 0
  ) {
    const firefliesGraphqlError = envelope.errors[0];

    return {
      ok: false,
      status:
        HTTP_STATUS_BY_FIREFLIES_ERROR_CODE[
          firefliesGraphqlError?.extensions?.code ?? ''
        ] ?? response.status,
      errorMessage: `Fireflies GraphQL error: ${formatFirefliesGraphqlError(
        firefliesGraphqlError,
      )}`,
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      errorMessage: `Fireflies API responded with HTTP ${response.status}`,
    };
  }

  if (!parseResult.ok) {
    return {
      ok: false,
      status: response.status,
      errorMessage: `Fireflies API returned a non-JSON response: ${parseResult.parseError.message}`,
    };
  }

  if (envelope === null || !isDefined(envelope.data)) {
    return {
      ok: false,
      status: response.status,
      errorMessage: 'Fireflies GraphQL response was missing a `data` field',
    };
  }

  return { ok: true, status: response.status, data: envelope.data };
};

const isTimeoutError = (error: unknown): boolean =>
  error instanceof Error && error.name === 'TimeoutError';

const buildFirefliesTimeoutMessage = (): string =>
  `Fireflies API request timed out after ${FIREFLIES_API_REQUEST_TIMEOUT_MILLISECONDS}ms`;

const formatFirefliesGraphqlError = (
  error: FirefliesGraphqlError | undefined,
): string => {
  const message = error?.message ?? 'Unknown Fireflies GraphQL error';
  const code = error?.extensions?.code;

  return isDefined(code)
    ? `${message} (Fireflies error code ${code})`
    : message;
};
