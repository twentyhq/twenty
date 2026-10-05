import { ErrorCode, type WebAPIRateLimitedError } from '@slack/web-api';
import { isObject } from '@sniptt/guards';

export const isSlackRateLimitedError = (
  error: unknown,
): error is WebAPIRateLimitedError =>
  isObject(error) &&
  'code' in error &&
  error.code === ErrorCode.RateLimitedError;
