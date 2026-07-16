import { isUndefined } from '@sniptt/guards';

import { type DirectusApiConfig } from 'src/logic-functions/directus-api/get-directus-api-config.util';

const DIRECTUS_API_MAX_ATTEMPTS = 3;
const DIRECTUS_API_RETRY_DELAY_MS = 500;

type DirectusApiRequestArgs = {
  config: DirectusApiConfig;
  path: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  allowNotFound?: boolean;
  maxAttempts?: number;
};

export type DirectusApiRequestResult<TData> =
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

export const directusApiRequest = async <TData>(
  requestArgs: DirectusApiRequestArgs,
): Promise<DirectusApiRequestResult<TData>> => {
  const maxAttempts = requestArgs.maxAttempts ?? DIRECTUS_API_MAX_ATTEMPTS;

  for (let attemptNumber = 1; ; attemptNumber++) {
    const { result, isRetryable } =
      await performDirectusApiRequestAttempt<TData>(requestArgs);

    if (!isRetryable || attemptNumber >= maxAttempts) {
      return result;
    }

    await sleep(DIRECTUS_API_RETRY_DELAY_MS * attemptNumber);
  }
};

const performDirectusApiRequestAttempt = async <TData>({
  config,
  path,
  method,
  body,
  allowNotFound = false,
}: DirectusApiRequestArgs): Promise<{
  result: DirectusApiRequestResult<TData>;
  isRetryable: boolean;
}> => {
  let response: Response;

  try {
    response = await fetch(`${config.url}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
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
        errorMessage: `Directus API request failed: ${
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
      isRetryable: isRetryableDirectusApiStatus(response.status),
      result: {
        ok: false,
        status: response.status,
        errorMessage: await extractDirectusApiErrorMessage(response),
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
        errorMessage: `Directus API returned a non-JSON response: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    };
  }
};

const isRetryableDirectusApiStatus = (status: number): boolean =>
  status === 429 || status >= 500;

const sleep = (delayMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

export const extractDirectusApiErrorMessage = async (
  response: Response,
): Promise<string> => {
  const fallback = `Directus API responded with HTTP ${response.status}`;

  try {
    const body = (await response.json()) as unknown;

    return `${fallback}: ${JSON.stringify(body)}`;
  } catch {
    return fallback;
  }
};
