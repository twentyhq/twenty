import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';

export const isUniqueViolationError = (error: unknown): boolean =>
  error instanceof QueryFailedError &&
  (error as QueryFailedError & { code?: string }).code ===
    POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION;
