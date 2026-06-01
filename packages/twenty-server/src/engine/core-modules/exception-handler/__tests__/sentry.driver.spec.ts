import * as Sentry from '@sentry/node';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { ExceptionHandlerSentryDriver } from 'src/engine/core-modules/exception-handler/drivers/sentry.driver';

jest.mock('@sentry/node', () => ({
  withScope: jest.fn(),
  captureException: jest.fn(),
}));

describe('ExceptionHandlerSentryDriver', () => {
  const setExtra = jest.fn();
  const setUser = jest.fn();
  const addBreadcrumb = jest.fn();
  const setContext = jest.fn();
  const setTag = jest.fn();
  const setFingerprint = jest.fn();
  const setLevel = jest.fn();

  const scope = {
    setExtra,
    setUser,
    addBreadcrumb,
    setContext,
    setTag,
    setFingerprint,
    setLevel,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (Sentry.withScope as jest.Mock).mockImplementation((callback) => {
      callback(scope);
    });
    (Sentry.captureException as jest.Mock).mockReturnValue('event-id');
  });

  it('should capture retryable postgres errors as warning and annotate metadata', () => {
    const driver = new ExceptionHandlerSentryDriver();
    const exception = new PostgresException(
      'deadlock detected',
      POSTGRESQL_ERROR_CODES.DEADLOCK_DETECTED,
    );

    driver.captureExceptions([exception]);

    expect(setTag).toHaveBeenCalledWith('postgresSqlErrorCode', '40P01');
    expect(setTag).toHaveBeenCalledWith('postgresSqlErrorType', 'retryable');
    expect(setContext).toHaveBeenCalledWith('postgres', {
      code: '40P01',
      isRetryable: true,
    });
    expect(setLevel).toHaveBeenCalledWith('warning');
  });

  it('should keep non-retryable postgres errors at error level', () => {
    const driver = new ExceptionHandlerSentryDriver();
    const exception = new PostgresException(
      'relation does not exist',
      POSTGRESQL_ERROR_CODES.UNDEFINED_TABLE,
    );

    driver.captureExceptions([exception]);

    expect(setTag).toHaveBeenCalledWith('postgresSqlErrorCode', '42P01');
    expect(setTag).toHaveBeenCalledWith(
      'postgresSqlErrorType',
      'non-retryable',
    );
    expect(setLevel).toHaveBeenCalledWith('error');
    expect(setLevel).not.toHaveBeenCalledWith('warning');
  });
});
