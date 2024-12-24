import { Injectable } from '@nestjs/common';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';

import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

@Injectable()
export class LoginTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async generateLoginToken(
    email: string,
    workspaceId: string,
  ): Promise<AuthToken> {
    const secret = this.jwtWrapperService.generateAppSecret(
      'LOGIN',
      workspaceId,
    );

    const expiresIn = this.environmentService.get('LOGIN_TOKEN_EXPIRES_IN');

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));
    const jwtPayload = {
      sub: email,
      workspaceId,
    };

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret,
        expiresIn,
      }),
      expiresAt,
    };
  }

  async verifyLoginToken(
    loginToken: string,
  ): Promise<{ sub: string; workspaceId: string }> {
    await this.jwtWrapperService.verifyWorkspaceToken(loginToken, 'LOGIN');

    return this.jwtWrapperService.decode(loginToken, {
      json: true,
    });
  }
}
