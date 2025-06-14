import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { Repository } from 'typeorm';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import {
  RefreshTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
  ) {}

  async verifyRefreshToken(refreshToken: string) {
    const coolDown = this.twentyConfigService.get('REFRESH_TOKEN_COOL_DOWN');

    await this.jwtWrapperService.verifyJwtToken(
      refreshToken,
      JwtTokenTypeEnum.REFRESH,
    );
    const jwtPayload =
      this.jwtWrapperService.decode<RefreshTokenJwtPayload>(refreshToken);

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

    // Check if revokedAt is less than coolDown
    if (
      token.revokedAt &&
      token.revokedAt.getTime() <= Date.now() - ms(coolDown)
    ) {
      // Revoke all user refresh tokens
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

    return {
      user,
      token,
      authProvider: jwtPayload.authProvider,
      targetedTokenType: jwtPayload.targetedTokenType,
    };
  }

  async generateRefreshToken(
    payload: Omit<RefreshTokenJwtPayload, 'type' | 'sub' | 'jti'>,
  ): Promise<AuthToken> {
    const secret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.REFRESH,
      payload.workspaceId ?? payload.userId,
    );
    const expiresIn = this.twentyConfigService.get('REFRESH_TOKEN_EXPIRES_IN');

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
