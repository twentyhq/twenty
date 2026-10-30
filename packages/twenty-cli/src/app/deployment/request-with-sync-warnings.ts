import { isArray, isNull, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';

// Older servers reject the selection before running anything, so asking again is safe
const isWarningsUnsupportedError = (error: unknown) => {
  if (!(error instanceof CliError) || error.code !== 'GRAPHQL_ERROR') {
    return false;
  }

  const errors = error.details?.errors;

  if (!isArray(errors) || errors.length !== 1) {
    return false;
  }

  const entry: unknown = errors[0];

  return (
    isPlainObject(entry) &&
    (entry.code === 'GRAPHQL_VALIDATION_FAILED' ||
      (isNull(entry.code) && error.details?.status === 400)) &&
    isString(entry.message) &&
    entry.message.startsWith('Cannot query field "warnings"')
  );
};

export const requestWithSyncWarnings = async <TResult>(
  request: (selection: { warnings?: true }) => Promise<TResult>,
): Promise<TResult> => {
  try {
    return await request({ warnings: true });
  } catch (error) {
    if (!isWarningsUnsupportedError(error)) {
      throw error;
    }

    return request({});
  }
};
