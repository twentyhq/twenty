import { isNonEmptyString, isObject } from '@sniptt/guards';

export const getSlackApiErrorCode = (error: unknown): string | undefined => {
  if (!isObject(error) || !('data' in error)) {
    return undefined;
  }

  const data = error.data;

  if (!isObject(data) || !('error' in data)) {
    return undefined;
  }

  return isNonEmptyString(data.error) ? data.error : undefined;
};
