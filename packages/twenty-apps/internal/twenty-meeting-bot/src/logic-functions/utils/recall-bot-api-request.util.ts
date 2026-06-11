import { RECALL_API_MAX_ATTEMPTS } from 'src/logic-functions/constants/recall-api-max-attempts';
import { RECALL_API_RETRY_DELAY_MS } from 'src/logic-functions/constants/recall-api-retry-delay-ms';

type RecallBotApiRequestArgs = {
  apiKey: string;
  baseUrl: string;
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  allowNotFound?: boolean;
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

// Retried creates can duplicate bots; duplicates stay unclaimed and get reaped.
export const recallBotApiRequest = async <TData>(
  requestArgs: RecallBotApiRequestArgs,
): Promise<RecallBotApiRequestResult<TData>> => {
  for (let attemptNumber = 1; ; attemptNumber++) {
    const { result, isRetryable } =
      await performRecallBotApiRequestAttempt<TData>(requestArgs);

    if (!isRetryable || attemptNumber >= RECALL_API_MAX_ATTEMPTS) {
      return result;
    }

    await sleep(RECALL_API_RETRY_DELAY_MS * attemptNumber);
  }
};

const performRecallBotApiRequestAttempt = async <TData>({
  apiKey,
  baseUrl,
  path,
  method,
  body,
  allowNotFound = false,
}: RecallBotApiRequestArgs): Promise<{
  result: RecallBotApiRequestResult<TData>;
  isRetryable: boolean;
}> => {
  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Authorization: buildRecallApiAuthorizationHeader(apiKey),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
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

const isRetryableRecallApiStatus = (status: number): boolean =>
  status === 429 || status >= 500;

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
