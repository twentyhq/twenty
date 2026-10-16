import { type ArgumentsHost } from '@nestjs/common';

import { type Response } from 'express';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { type HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';

describe('AuthRestApiExceptionFilter', () => {
  const handleError = jest.fn();
  const response = {} as Response;
  const service = { handleError } as unknown as HttpExceptionHandlerService;
  const filter = new AuthRestApiExceptionFilter(service);
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;

  it.each([
    [AuthExceptionCode.UNAUTHENTICATED, 401],
    [AuthExceptionCode.APPLICATION_REFRESH_TOKEN_INVALID_OR_EXPIRED, 401],
    [AuthExceptionCode.FORBIDDEN_EXCEPTION, 403],
    [AuthExceptionCode.INSUFFICIENT_SCOPES, 403],
  ])('maps %s to %s', (code, status) => {
    const exception = new AuthException('Authentication failed', code);

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(exception, response, status);
  });
});
