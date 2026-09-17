import { isString } from '@sniptt/guards';
import { type AxiosError, isAxiosError } from 'axios';

type GoogleErrorResponseData = {
  error?: {
    errors?: { reason?: string }[];
  };
};

const NETWORK_ERROR_CODES = new Set([
  'ECONNABORTED',
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'ENOTFOUND',
  'ERR_NETWORK',
  'ETIMEDOUT',
]);

const RATE_LIMIT_REASONS = new Set([
  'rateLimitExceeded',
  'userRateLimitExceeded',
  'dailyLimitExceeded',
]);

const INSUFFICIENT_PERMISSIONS_REASON = 'insufficientPermissions';

const getGoogleErrorReasons = (error: AxiosError<GoogleErrorResponseData>) =>
  (error.response?.data?.error?.errors ?? [])
    .map(({ reason }) => reason)
    .filter(isString);

export const isGoogleRateLimitError = (error: unknown) => {
  if (!isAxiosError<GoogleErrorResponseData>(error)) {
    return false;
  }

  const status = error.response?.status;

  return (
    status === 429 ||
    (status === 403 &&
      getGoogleErrorReasons(error).some((reason) =>
        RATE_LIMIT_REASONS.has(reason),
      ))
  );
};

export const isTransientGoogleError = (error: unknown) => {
  if (!isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;

  return (
    (error.code !== undefined && NETWORK_ERROR_CODES.has(error.code)) ||
    isGoogleRateLimitError(error) ||
    (status !== undefined && status >= 500)
  );
};

export const isGoogleAuthorizationFailure = (error: unknown) => {
  if (!isAxiosError<GoogleErrorResponseData>(error)) {
    return false;
  }

  const status = error.response?.status;

  return (
    status === 401 ||
    (status === 403 &&
      getGoogleErrorReasons(error).includes(INSUFFICIENT_PERMISSIONS_REASON))
  );
};
