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
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { User } from 'src/engine/core-modules/user/user.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly environmentService: EnvironmentService,
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
  ) {}

  async verifyRefreshToken(refreshToken: string) {
    const coolDown = this.environmentService.get('REFRESH_TOKEN_COOL_DOWN');

    await this.jwtWrapperService.verifyWorkspaceToken(refreshToken, 'REFRESH');
    const jwtPayload = await this.jwtWrapperService.decode(refreshToken);

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

    // TODO: Delete this useless condition and error after March 31st 2025
    if (!token.workspaceId) {
      throw new AuthException(
        'This refresh token is malformed',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    return { user, token };
  }

  async generateRefreshToken(
    userId: string,
    workspaceId: string,
  ): Promise<AuthToken> {
    const secret = this.jwtWrapperService.generateAppSecret(
      'REFRESH',
      workspaceId,
    );
    const expiresIn = this.environmentService.get('REFRESH_TOKEN_EXPIRES_IN');

    if (!expiresIn) {
      throw new AuthException(
        'Expiration time for access token is not set',
        AuthExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const expiresAt = addMilliseconds(new Date().getTime(), ms(expiresIn));

    const refreshTokenPayload = {
      userId,
      expiresAt,
      workspaceId,
      type: AppTokenType.RefreshToken,
    };
    const jwtPayload = {
      sub: userId,
      workspaceId,
    };

    const refreshToken = this.appTokenRepository.create(refreshTokenPayload);

    await this.appTokenRepository.save(refreshToken);

    return {
      token: this.jwtWrapperService.sign(jwtPayload, {
        secret,
        expiresIn,
        // Jwtid will be used to link RefreshToken entity to this token
        jwtid: refreshToken.id,
      }),
      expiresAt,
    };
  }
}
