import { Injectable } from '@nestjs/common';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';

import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type LoginTokenJwtPayload } from 'src/engine/core-modules/auth/types/login-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

@Injectable()
export class LoginTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async generateLoginToken(
    email: string,
    workspaceId: string,
    authProvider: AuthProviderEnum,
    options?: { impersonatorUserWorkspaceId?: string },
  ): Promise<AuthToken> {
    if (!Object.values(AuthProviderEnum).includes(authProvider)) {
      throw new AuthException(
        'Authentication provider is required to generate a login token',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const jwtPayload: LoginTokenJwtPayload = {
      type: JwtTokenTypeEnum.LOGIN,
      sub: email,
      workspaceId,
      authProvider,
      impersonatorUserWorkspaceId: options?.impersonatorUserWorkspaceId,
    };

    const expiresIn = this.twentyConfigService.get('LOGIN_TOKEN_EXPIRES_IN');

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    return {
      token: await this.jwtWrapperService.signAsyncOrThrow(jwtPayload, {
        expiresIn,
      }),
      expiresAt,
    };
  }

  async verifyLoginToken(loginToken: string): Promise<LoginTokenJwtPayload> {
    await this.jwtWrapperService.verifyJwtToken(loginToken);

    const decoded = this.jwtWrapperService.decode<LoginTokenJwtPayload>(
      loginToken,
      { json: true },
    );

    if (decoded.type !== JwtTokenTypeEnum.LOGIN) {
      throw new AuthException(
        'Expected a login token',
        AuthExceptionCode.INVALID_JWT_TOKEN_TYPE,
      );
    }

    if (!Object.values(AuthProviderEnum).includes(decoded.authProvider)) {
      throw new AuthException(
        'Login token has an invalid authentication provider',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    return decoded;
  }
}
