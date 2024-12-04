import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

import { Response } from 'express';

import { ErrorHandlerService } from 'src/engine/core-modules/auth/auth-exception-handler.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

@Catch(AuthException)
export class AuthRestApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorHandlerService: ErrorHandlerService) {}

  catch(exception: AuthException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case AuthExceptionCode.USER_NOT_FOUND:
      case AuthExceptionCode.CLIENT_NOT_FOUND:
        return this.errorHandlerService.handleError(exception, response, 404);
      case AuthExceptionCode.INVALID_INPUT:
      case AuthExceptionCode.INVALID_DATA:
        return this.errorHandlerService.handleError(exception, response, 400);
      case AuthExceptionCode.FORBIDDEN_EXCEPTION:
        return this.errorHandlerService.handleError(exception, response, 401);
      case AuthExceptionCode.INTERNAL_SERVER_ERROR:
      default:
        return this.errorHandlerService.handleError(exception, response, 500);
    }
  }
}
