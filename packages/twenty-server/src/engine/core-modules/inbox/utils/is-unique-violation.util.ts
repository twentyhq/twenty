import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';

// Losing a race to another producer is an expected outcome here, not a failure:
// both the slot index and the one-default-queue index are how concurrent writers
// agree on a single row.
export const isUniqueViolation = (error: unknown): boolean =>
  error instanceof QueryFailedError &&
  (error as QueryFailedError & { code?: string }).code ===
    POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION;
