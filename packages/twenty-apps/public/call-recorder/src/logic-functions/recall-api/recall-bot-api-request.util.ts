import { isUndefined } from '@sniptt/guards';

import { RECALL_API_MAX_IN_PROCESS_RETRY_WAIT_MS } from 'src/logic-functions/constants/recall-api-max-in-process-retry-wait-ms';
import { RECALL_API_MAX_ATTEMPTS } from 'src/logic-functions/constants/recall-api-max-attempts';
import { type RecallApiConfig } from 'src/logic-functions/recall-api/get-recall-api-config.util';
import { parseRecallRetryAfterMs } from 'src/logic-functions/recall-api/parse-recall-retry-after.util';
import { reserveRecallApiRateLimitSlotMs } from 'src/logic-functions/recall-api/recall-api-rate-limiter.util';
import {
  isRetryableRecallApiStatus,
  resolveRecallApiRetryDelayMs,
} from 'src/logic-functions/recall-api/recall-api-retry-policy.util';

type RecallBotApiRequestArgs = {
  config: RecallApiConfig;
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  allowNotFound?: boolean;
  maxAttempts?: number;
};

type RecallBotApiRequestResult<TData> =
  | {
      ok: true;
      status: number;
      data: TData;
    }
  | {
      ok: false;
      status: number | null;
      errorMessage: string;
    };

// Bot creates tolerate retries because duplicates stay unclaimed and get reaped.
// Callers that cannot retry idempotently can lower maxAttempts.
export const recallBotApiRequest = async <TData>(
  requestArgs: RecallBotApiRequestArgs,
): Promise<RecallBotApiRequestResult<TData>> => {
  const maxAttempts = requestArgs.maxAttempts ?? RECALL_API_MAX_ATTEMPTS;

  for (let attemptNumber = 1; ; attemptNumber++) {
    const { result, isRetryable, retryAfterMs } =
      await performRecallBotApiRequestAttempt<TData>(requestArgs);

    if (!isRetryable || attemptNumber >= maxAttempts) {
      return result;
    }

    const retryDelayMs = resolveRecallApiRetryDelayMs({
      retryAfterMs,
      status: result.status,
      attemptNumber,
    });

    // Blocking longer than one invocation can safely spare would sleep straight
    // into a timeout kill, so defer to the reconcilers, which re-drive the row.
    if (retryDelayMs > RECALL_API_MAX_IN_PROCESS_RETRY_WAIT_MS) {
      return result;
    }

    await sleep(retryDelayMs);
  }
};

const performRecallBotApiRequestAttempt = async <TData>({
  config,
  path,
  method,
  body,
  allowNotFound = false,
}: RecallBotApiRequestArgs): Promise<{
  result: RecallBotApiRequestResult<TData>;
  isRetryable: boolean;
  retryAfterMs?: number;
}> => {
  const rateLimitWaitMs = reserveRecallApiRateLimitSlotMs({
    method,
    path,
    nowMs: Date.now(),
  });

  if (rateLimitWaitMs > 0) {
    await sleep(rateLimitWaitMs);
  }

  let response: Response;

  try {
    response = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: buildRecallApiAuthorizationHeader(config.apiKey),
        ...(isUndefined(body) ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(isUndefined(body) ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    return {
      isRetryable: true,
      result: {
        ok: false,
        status: null,
        errorMessage: `Recall API request failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    };
  }

  if (allowNotFound && response.status === 404) {
    return {
      isRetryable: false,
      result: {
        ok: true,
        status: response.status,
        data: undefined as TData,
      },
    };
  }

  if (response.status === 204) {
    return {
      isRetryable: false,
      result: {
        ok: true,
        status: response.status,
        data: undefined as TData,
      },
    };
  }

  if (!response.ok) {
    return {
      isRetryable: isRetryableRecallApiStatus(response.status),
      retryAfterMs: parseRecallRetryAfterMs(
        response.headers?.get('retry-after') ?? null,
        Date.now(),
      ),
      result: {
        ok: false,
        status: response.status,
        errorMessage: await extractRecallApiErrorMessage(response),
      },
    };
  }

  try {
    return {
      isRetryable: false,
      result: {
        ok: true,
        status: response.status,
        data: (await response.json()) as TData,
      },
    };
  } catch (error) {
    return {
      isRetryable: false,
      result: {
        ok: false,
        status: response.status,
        errorMessage: `Recall API returned a non-JSON response: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    };
  }
};

const sleep = (delayMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

const buildRecallApiAuthorizationHeader = (apiKey: string): string => {
  const trimmedApiKey = apiKey.trim();

  return trimmedApiKey.toLowerCase().startsWith('token ')
    ? trimmedApiKey
    : `Token ${trimmedApiKey}`;
};

const extractRecallApiErrorMessage = async (
  response: Response,
): Promise<string> => {
  const fallback = `Recall API responded with HTTP ${response.status}`;

  try {
    const body = (await response.json()) as unknown;

    return `${fallback}: ${JSON.stringify(body)}`;
  } catch {
    return fallback;
  }
};
