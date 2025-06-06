import { Injectable } from '@nestjs/common';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';

import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  LoginTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';

@Injectable()
export class LoginTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async generateLoginToken(
    email: string,
    workspaceId: string,
  ): Promise<AuthToken> {
    const jwtPayload: LoginTokenJwtPayload = {
      type: JwtTokenTypeEnum.LOGIN,
      sub: email,
      workspaceId,
    };

    const secret = this.jwtWrapperService.generateAppSecret(
      jwtPayload.type,
      workspaceId,
    );

    const expiresIn = this.twentyConfigService.get('LOGIN_TOKEN_EXPIRES_IN');

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

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
    await this.jwtWrapperService.verifyJwtToken(
      loginToken,
      JwtTokenTypeEnum.LOGIN,
    );

    return this.jwtWrapperService.decode(loginToken, {
      json: true,
    });
  }
}
