import { isArray, isNull } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';

export const isApplicationNotFoundError = ({
  error,
  field,
}: {
  error: unknown;
  field: string;
}) => {
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
    entry.code === 'NOT_FOUND' &&
    entry.subCode === 'APPLICATION_NOT_FOUND' &&
    (isNull(entry.path) || (isArray(entry.path) && entry.path[0] === field))
  );
};
