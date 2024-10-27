import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
} from '@nestjs/common';

import { Response } from 'express';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Catch(AuthException)
export class AuthOAuthExceptionFilter implements ExceptionFilter {
  constructor(private readonly environmentService: EnvironmentService) {}

  catch(exception: AuthException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case AuthExceptionCode.OAUTH_ACCESS_DENIED:
        response
          .status(403)
          .redirect(this.environmentService.get('FRONT_BASE_URL'));
        break;
      default:
        throw new InternalServerErrorException(exception.message);
    }
  }
}
