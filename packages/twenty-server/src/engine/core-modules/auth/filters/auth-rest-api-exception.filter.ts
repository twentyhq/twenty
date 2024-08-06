import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';

@Catch(AuthException)
export class AuthRestApiExceptionFilter implements ExceptionFilter {
  catch(exception: AuthException, _: ArgumentsHost) {
    switch (exception.code) {
      case AuthExceptionCode.USER_NOT_FOUND:
      case AuthExceptionCode.CLIENT_NOT_FOUND:
        throw new NotFoundException(exception.message);
      case AuthExceptionCode.INVALID_INPUT:
        throw new BadRequestException(exception.message);
      case AuthExceptionCode.FORBIDDEN_EXCEPTION:
        throw new UnauthorizedException(exception.message);
      case AuthExceptionCode.INVALID_DATA:
      case AuthExceptionCode.INTERNAL_SERVER_ERROR:
      default:
        throw new InternalServerErrorException(exception.message);
    }
  }
}
