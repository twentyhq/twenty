import axios, { type AxiosInstance } from 'axios';
import { isDefined } from 'twenty-sdk/utils';

import { describeError } from 'src/logic-functions/data/describe-error.util';
import {
  executeWithRetry,
  type RetryPolicy,
} from 'src/logic-functions/data/execute-with-retry.util';
import { GoogleAuthFailedError } from 'src/logic-functions/data/google-auth-failed.error';

const GOOGLE_PEOPLE_BASE_URL = 'https://people.googleapis.com/v1';
const GOOGLE_REQUEST_TIMEOUT_MILLISECONDS = 30_000;
const UNAUTHORIZED_STATUSES = [401, 403];
const RETRYABLE_STATUSES = [429, 500, 502, 503, 504];

export const createGoogleClient = (accessToken: string): AxiosInstance =>
  axios.create({
    baseURL: GOOGLE_PEOPLE_BASE_URL,
    timeout: GOOGLE_REQUEST_TIMEOUT_MILLISECONDS,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const readGoogleErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

export const describeGoogleError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    return isDefined(responseData)
      ? JSON.stringify(responseData)
      : error.message;
  }

  return describeError(error);
};

const throwOnUnauthorized = async <TResult>(
  request: () => Promise<TResult>,
): Promise<TResult> => {
  try {
    return await request();
  } catch (error) {
    const status = readGoogleErrorStatus(error);

    if (isDefined(status) && UNAUTHORIZED_STATUSES.includes(status)) {
      throw new GoogleAuthFailedError(status);
    }

    throw error;
  }
};

// An axios error carries the status, so retryability is read from it rather
// than from the message. A request that never got a response failed at the
// network or timeout level and is retried too.
const GOOGLE_RETRY_POLICY: RetryPolicy = {
  isRetryable: (error) => {
    if (!axios.isAxiosError(error)) {
      return false;
    }

    const status = readGoogleErrorStatus(error);

    return isDefined(status) ? RETRYABLE_STATUSES.includes(status) : true;
  },
  readRetryAfterMs: (error) => {
    const retryAfterSeconds = Number(
      axios.isAxiosError(error)
        ? error.response?.headers?.['retry-after']
        : undefined,
    );

    return Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? retryAfterSeconds * 1_000
      : undefined;
  },
};

export const callGoogle = <TResult>(
  request: () => Promise<TResult>,
): Promise<TResult> =>
  executeWithRetry(() => throwOnUnauthorized(request), GOOGLE_RETRY_POLICY);

// The People API takes no idempotency key, so a retried request that timed out
// after Google applied it would write the same contacts twice.
export const callGoogleWithoutRetry = <TResult>(
  request: () => Promise<TResult>,
): Promise<TResult> => throwOnUnauthorized(request);
