import axios, { type AxiosInstance } from 'axios';
import { isDefined } from 'twenty-sdk/utils';

import { executeWithRetry } from 'src/logic-functions/data/execute-with-retry.util';
import { GoogleAuthFailedError } from 'src/logic-functions/data/google-auth-failed.error';

const GOOGLE_PEOPLE_BASE_URL = 'https://people.googleapis.com/v1';
const GOOGLE_REQUEST_TIMEOUT_MILLISECONDS = 30_000;
const UNAUTHORIZED_STATUSES = [401, 403];

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

  return error instanceof Error ? error.message : String(error);
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

export const callGoogle = <TResult>(
  request: () => Promise<TResult>,
): Promise<TResult> => executeWithRetry(() => throwOnUnauthorized(request));

// The People API takes no idempotency key, so a retried request that timed out
// after Google applied it would write the same contacts twice.
export const callGoogleWithoutRetry = <TResult>(
  request: () => Promise<TResult>,
): Promise<TResult> => throwOnUnauthorized(request);
