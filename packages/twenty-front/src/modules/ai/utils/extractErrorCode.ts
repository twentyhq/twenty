import { isDefined } from 'twenty-shared/utils';

// Type guard for error objects with a code property
const isErrorWithCode = (
  error: unknown,
): error is { code: string; message?: string } => {
  return (
    isDefined(error) &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
};

// Type guard for nested error structures (e.g., { error: { code: '...' } })
const isNestedErrorWithCode = (
  error: unknown,
): error is { error: { code: string } } => {
  return (
    isDefined(error) &&
    typeof error === 'object' &&
    'error' in error &&
    isErrorWithCode((error as { error: unknown }).error)
  );
};

// Type guard for deeply nested error structures (e.g., { data: { error: { code: '...' } } })
const isDeepNestedErrorWithCode = (
  error: unknown,
): error is { data: { error: { code: string } } } => {
  return (
    isDefined(error) &&
    typeof error === 'object' &&
    'data' in error &&
    isNestedErrorWithCode((error as { data: unknown }).data)
  );
};

export const extractErrorCode = (error: unknown): string | undefined => {
  if (isErrorWithCode(error)) {
    return error.code;
  }

  if (isNestedErrorWithCode(error)) {
    return error.error.code;
  }

  if (isDeepNestedErrorWithCode(error)) {
    return error.data.error.code;
  }

  return undefined;
};
