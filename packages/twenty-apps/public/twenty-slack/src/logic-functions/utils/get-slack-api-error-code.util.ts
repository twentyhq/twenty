import { isNonEmptyString } from '@sniptt/guards';

export const getSlackApiErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null || !('data' in error)) {
    return undefined;
  }

  const data = error.data;

  if (typeof data !== 'object' || data === null || !('error' in data)) {
    return undefined;
  }

  return isNonEmptyString(data.error) ? data.error : undefined;
};
