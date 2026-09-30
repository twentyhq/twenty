import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { isDefined } from 'twenty-shared/utils';

import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type LoginTokenJwtPayload } from 'src/engine/core-modules/auth/types/login-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

const LOGIN_TOKEN_CONSUMED_KEY_PREFIX = 'login-token';

const buildInvalidLoginTokenException = () =>
  new AuthException('Invalid login token', AuthExceptionCode.UNAUTHENTICATED, {
    userFriendlyMessage: msg`Authentication failed, please sign in again.`,
  });

const buildAlreadyUsedLoginTokenException = () =>
  new AuthException(
    'Login token has already been used',
    AuthExceptionCode.UNAUTHENTICATED,
    {
      userFriendlyMessage: msg`Authentication failed, please sign in again.`,
    },
  );

@Injectable()
export class LoginTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectCacheStorage(CacheStorageNamespace.EngineAuthSession)
    private readonly cacheStorageService: CacheStorageService,
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
      jti: randomUUID(),
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

    if (!isNonEmptyString(decoded.jti)) {
      throw buildInvalidLoginTokenException();
    }

    return decoded;
  }

  async consumeLoginTokenOrThrow(payload: LoginTokenJwtPayload): Promise<void> {
    if (!isNonEmptyString(payload.jti)) {
      throw buildInvalidLoginTokenException();
    }

    const ttlMs = this.getRemainingLifetimeMs(payload);

    if (ttlMs <= 0) {
      throw buildInvalidLoginTokenException();
    }

    const wasClaimed = await this.cacheStorageService.setIfAbsent(
      `${LOGIN_TOKEN_CONSUMED_KEY_PREFIX}:${payload.jti}`,
      '1',
      ttlMs,
    );

    if (!wasClaimed) {
      throw buildAlreadyUsedLoginTokenException();
    }
  }

  private getRemainingLifetimeMs(payload: LoginTokenJwtPayload): number {
    if (isDefined(payload.exp) && Number.isFinite(payload.exp)) {
      return payload.exp * 1000 - Date.now();
    }

    const expiresIn = this.twentyConfigService.get('LOGIN_TOKEN_EXPIRES_IN');

    return ms(expiresIn);
  }
}
