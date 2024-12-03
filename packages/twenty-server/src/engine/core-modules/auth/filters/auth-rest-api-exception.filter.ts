import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

import {
  InternalServerErrorExceptionError,
  NotFoundExceptionError,
} from 'src/engine/core-modules/auth/auth-errors.util';
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

  catch(exception: AuthException, _: ArgumentsHost) {
    this.exceptionHandlerService.captureExceptions([exception], {});

    switch (exception.code) {
      case AuthExceptionCode.USER_NOT_FOUND:
      case AuthExceptionCode.CLIENT_NOT_FOUND:
        throw new NotFoundExceptionError(exception.message);
      case AuthExceptionCode.INVALID_INPUT:
        throw new BadRequestException(exception.message);
      case AuthExceptionCode.FORBIDDEN_EXCEPTION:
        // throw new UnauthorizedException(exception.message);
        console.log('AuthRestApiExceptionFilter', exception);
        // throw new UnauthorizedExceptionError(exception.message);
        throw new HttpException(exception.message, 401);
      case AuthExceptionCode.INVALID_DATA:
      case AuthExceptionCode.INTERNAL_SERVER_ERROR:
      default:
        throw new InternalServerErrorExceptionError(exception.message);
    }
  }
}
