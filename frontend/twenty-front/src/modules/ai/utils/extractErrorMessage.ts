import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

const isObjectWithMessage = (error: unknown): error is { message: string } => {
  return (
    isDefined(error) &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  );
};

const isErrorWithNestedError = (
  error: unknown,
): error is {
  error: { message: string };
} => {
  return (
    isDefined(error) &&
    typeof error === 'object' &&
    'error' in error &&
    isDefined(error.error) &&
    typeof error.error === 'object' &&
    'message' in error.error &&
    typeof error.error.message === 'string'
  );
};

const isDeepNestedError = (
  error: unknown,
): error is {
  data: { error: { message: string } };
} => {
  return (
    isDefined(error) &&
    typeof error === 'object' &&
    'data' in error &&
    isDefined(error.data) &&
    typeof error.data === 'object' &&
    'error' in error.data &&
    isDefined(error.data.error) &&
    typeof error.data.error === 'object' &&
    'message' in error.data.error &&
    typeof error.data.error.message === 'string'
  );
};

export const extractErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (isObjectWithMessage(error)) {
    return error.message;
  }

  if (isErrorWithNestedError(error)) {
    return error.error.message;
  }

  if (isDeepNestedError(error)) {
    return error.data.error.message;
  }

  return t`An unexpected error occurred`;
};
