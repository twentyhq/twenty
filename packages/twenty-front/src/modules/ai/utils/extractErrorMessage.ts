import { isDefined } from 'twenty-shared/utils';

export const extractErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (isDefined(error) && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }

    if (
      'error' in error &&
      isDefined(error.error) &&
      typeof error.error === 'object'
    ) {
      if ('message' in error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }
    }

    if (
      'data' in error &&
      isDefined(error.data) &&
      typeof error.data === 'object' &&
      'error' in error.data &&
      isDefined(error.data.error) &&
      typeof error.data.error === 'object' &&
      'message' in error.data.error &&
      typeof error.data.error.message === 'string'
    ) {
      return error.data.error.message;
    }
  }

  return 'An unexpected error occurred';
};
