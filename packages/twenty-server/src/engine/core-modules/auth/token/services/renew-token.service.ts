import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';

@Injectable()
export class RenewTokenService {
  constructor(
    @InjectRepository(AppToken, 'core')
    private readonly appTokenRepository: Repository<AppToken>,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async generateTokensFromRefreshToken(token: string): Promise<{
    accessToken: AuthToken;
    refreshToken: AuthToken;
  }> {
    if (!token) {
      throw new AuthException(
        'Refresh token not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const {
      user,
      token: { id, workspaceId },
    } = await this.refreshTokenService.verifyRefreshToken(token);

    // Revoke old refresh token
    await this.appTokenRepository.update(
      {
        id,
      },
      {
        revokedAt: new Date(),
      },
    );

    const accessToken = await this.accessTokenService.generateAccessToken(
      user.id,
      workspaceId,
    );
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
      workspaceId,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
