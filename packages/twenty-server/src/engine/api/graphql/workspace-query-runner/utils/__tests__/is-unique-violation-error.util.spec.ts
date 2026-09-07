import { QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { isUniqueViolationError } from 'src/engine/api/graphql/workspace-query-runner/utils/is-unique-violation-error.util';

describe('isUniqueViolationError', () => {
  it('recognises a unique violation raised by the driver', () => {
    const error = new QueryFailedError(
      'INSERT',
      [],
      Object.assign(new Error('duplicate key value'), {
        code: POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION,
      }),
    );

    expect(isUniqueViolationError(error)).toBe(true);
  });

  it('ignores other Postgres error codes', () => {
    expect(
      isUniqueViolationError({ code: POSTGRESQL_ERROR_CODES.QUERY_CANCELED }),
    ).toBe(false);
  });

  it('ignores errors without a code', () => {
    expect(isUniqueViolationError(new Error('boom'))).toBe(false);
    expect(isUniqueViolationError(null)).toBe(false);
  });
});
