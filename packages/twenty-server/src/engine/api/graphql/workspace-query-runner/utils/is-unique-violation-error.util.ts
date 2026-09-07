import { isDefined } from 'twenty-shared/utils';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';

export const isUniqueViolationError = (error: unknown): boolean => {
  if (!isDefined(error) || typeof error !== 'object' || !('code' in error)) {
    return false;
  }

  return error.code === POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION;
};
