import { type Response } from 'express';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { PostgresException } from 'src/engine/api/graphql/workspace-query-runner/utils/postgres-exception';
import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';

const buildResponse = () => {
  const send = jest.fn();
  const status = jest.fn().mockReturnValue({ send });

  return { status, send } as unknown as Response & { status: jest.Mock };
};

describe('HttpExceptionHandlerService', () => {
  const exceptionHandlerService = {
    captureExceptions: jest.fn(),
  } as unknown as ExceptionHandlerService;

  const service = new HttpExceptionHandlerService(exceptionHandlerService, {
    request: null,
    params: {},
  });

  it('should return 400 for a Postgres integrity-constraint violation (client input)', () => {
    const response = buildResponse();

    service.handleError(
      new PostgresException(
        'Data validation error.',
        POSTGRESQL_ERROR_CODES.NOT_NULL_VIOLATION,
      ),
      response,
    );

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 for a Postgres data exception (client input)', () => {
    const response = buildResponse();

    service.handleError(
      new PostgresException(
        'Data validation error.',
        POSTGRESQL_ERROR_CODES.NUMERIC_VALUE_OUT_OF_RANGE,
      ),
      response,
    );

    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('should keep 500 for a server-side Postgres error (connection failure)', () => {
    const response = buildResponse();

    service.handleError(
      new PostgresException(
        'Data validation error.',
        POSTGRESQL_ERROR_CODES.CONNECTION_FAILURE,
      ),
      response,
    );

    expect(response.status).toHaveBeenCalledWith(500);
  });
});
