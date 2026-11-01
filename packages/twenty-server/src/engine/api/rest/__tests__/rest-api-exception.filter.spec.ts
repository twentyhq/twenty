import { HttpException, HttpStatus, type ArgumentsHost } from '@nestjs/common';

import { type Response } from 'express';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { type HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('RestApiExceptionFilter', () => {
  const handleError = jest.fn();
  const set = jest.fn();
  const response = { set } as unknown as Response;

  const httpExceptionHandlerService = {
    handleError,
  } as unknown as HttpExceptionHandlerService;

  const filter = new RestApiExceptionFilter(httpExceptionHandlerService);

  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should map PermissionsException PERMISSION_DENIED to 403', () => {
    const exception = new PermissionsException(
      'Entity performing the request does not have permission',
      PermissionsExceptionCode.PERMISSION_DENIED,
    );

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(exception, response, 403);
  });

  it('should map HttpException to its status code', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(exception, response, 403);
  });

  it('should default non-HttpException to 400', () => {
    const exception = new Error('Generic error');

    filter.catch(exception, host);

    expect(handleError).toHaveBeenCalledWith(exception, response, 400);
  });
});
