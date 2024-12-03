import { Injectable } from '@nestjs/common';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';

import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import {
  EnvironmentException,
  EnvironmentExceptionCode,
} from 'src/engine/core-modules/environment/environment.exception';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

@Injectable()
export class LoginTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async generateLoginToken(email: string): Promise<AuthToken> {
    const secret = this.jwtWrapperService.generateAppSecret('LOGIN');

    const expiresIn = this.environmentService.get('LOGIN_TOKEN_EXPIRES_IN');

    if (!expiresIn) {
      throw new EnvironmentException(
        'Expiration time for access token is not set',
        EnvironmentExceptionCode.ENVIRONMENT_VARIABLES_NOT_FOUND,
      );
    }

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));
    const jwtPayload = {
      sub: email,
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret,
        expiresIn,
      }),
      expiresAt,
    };
  }

  async verifyLoginToken(loginToken: string): Promise<{ sub: string }> {
    await this.jwtWrapperService.verifyWorkspaceToken(loginToken, 'LOGIN');

    return this.jwtWrapperService.decode(loginToken, {
      json: true,
    });
  }
}
