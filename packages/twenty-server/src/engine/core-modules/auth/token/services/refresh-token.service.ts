import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import {
  type RefreshTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async verifyRefreshToken(refreshToken: string) {
    const reuseGracePeriod = this.twentyConfigService.get(
      'REFRESH_TOKEN_REUSE_GRACE_PERIOD',
    );

    await this.jwtWrapperService.verifyJwtToken(refreshToken);
    const jwtPayload =
      this.jwtWrapperService.decode<RefreshTokenJwtPayload>(refreshToken);

    if (jwtPayload.type !== JwtTokenTypeEnum.REFRESH) {
      throw new AuthException(
        'Expected a refresh token',
        AuthExceptionCode.INVALID_JWT_TOKEN_TYPE,
      );
    }

    if (!(jwtPayload.jti && jwtPayload.sub)) {
      throw new AuthException(
        'This refresh token is malformed',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const token = await this.appTokenRepository.findOneBy({
      id: jwtPayload.jti,
    });

    if (!token) {
      throw new AuthException(
        "This refresh token doesn't exist",
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: jwtPayload.sub },
      relations: ['appTokens'],
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    if (token.revokedAt) {
      const wasRevokedBeforeGracePeriod =
        token.revokedAt.getTime() <= Date.now() - ms(reuseGracePeriod);

      if (wasRevokedBeforeGracePeriod) {
        // Token was revoked long ago and is being reused -- suspicious.
        // Revoke all user refresh tokens as a safety measure.
        await Promise.all(
          user.appTokens.map(async ({ id, type }) => {
            if (type === AppTokenType.RefreshToken) {
              await this.appTokenRepository.update(
                { id },
                {
                  revokedAt: new Date(),
                },
              );
            }
          }),
        );

        throw new AuthException(
          'Suspicious activity detected, this refresh token has been revoked. All tokens have been revoked.',
          AuthExceptionCode.FORBIDDEN_EXCEPTION,
        );
      }

      // Token was revoked recently (within grace period). This is expected
      // when concurrent requests (e.g. two browser tabs) race to refresh
      // at the same time. Allow it but don't reset the original revokedAt
      // timestamp so the grace window stays anchored and cannot be extended.
    }

    return {
      user,
      token,
      authProvider: jwtPayload.authProvider,
      targetedTokenType: jwtPayload.targetedTokenType,
      isImpersonating: jwtPayload.isImpersonating,
      impersonatorUserWorkspaceId: jwtPayload.impersonatorUserWorkspaceId,
      impersonatedUserWorkspaceId: jwtPayload.impersonatedUserWorkspaceId,
    };
  }

  async generateRefreshToken(
    payload: Omit<RefreshTokenJwtPayload, 'type' | 'sub' | 'jti'>,
    isImpersonationToken: boolean = false,
  ): Promise<AuthToken> {
    const secret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.REFRESH,
      payload.workspaceId ?? payload.userId,
    );
    const expiresIn = isImpersonationToken
      ? '1d'
      : this.twentyConfigService.get('REFRESH_TOKEN_EXPIRES_IN');

    if (!expiresIn) {
      throw new AuthException(
        'Expiration time for access token is not set',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const refreshToken = this.appTokenRepository.create({
      ...payload,
      expiresAt,
      type: AppTokenType.RefreshToken,
    });

    await this.appTokenRepository.save(refreshToken);

    return {
      token: this.jwtWrapperService.sign(
        {
          ...payload,
          sub: payload.userId,
          type: JwtTokenTypeEnum.REFRESH,
        },
        {
          secret,
          expiresIn,
          jwtid: refreshToken.id,
        },
      ),
      expiresAt,
    };
  }
}
