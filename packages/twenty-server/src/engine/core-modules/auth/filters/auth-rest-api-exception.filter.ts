import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { Response } from 'express';

import { ErrorHandlerService } from 'src/engine/core-modules/auth/auth-errors.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';

@Catch(AuthException)
export class AuthRestApiExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  catch(exception: AuthException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorHandlerService = new ErrorHandlerService(
      this.exceptionHandlerService,
    );

    switch (exception.code) {
      case AuthExceptionCode.USER_NOT_FOUND:
      case AuthExceptionCode.CLIENT_NOT_FOUND:
        return errorHandlerService.handleError(exception, response, 404);
      case AuthExceptionCode.INVALID_INPUT:
        return errorHandlerService.handleError(exception, response, 400);
      case AuthExceptionCode.FORBIDDEN_EXCEPTION:
        return errorHandlerService.handleError(exception, response, 401);
      case AuthExceptionCode.INVALID_DATA:
      case AuthExceptionCode.INTERNAL_SERVER_ERROR:
      default:
        return errorHandlerService.handleError(exception, response, 500);
    }
  }
}
