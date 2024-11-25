import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { User } from 'src/engine/core-modules/user/user.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
  ) {}

  async impersonate(userIdentifier: string, userImpersonating: User) {
    if (!userImpersonating.canImpersonate) {
      throw new AuthException(
        'User cannot impersonate',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const isEmail = userIdentifier.includes('@');

    const user = await this.userRepository.findOne({
      where: isEmail ? { email: userIdentifier } : { id: userIdentifier },
      relations: ['defaultWorkspace', 'workspaces', 'workspaces.workspace'],
    });

    if (!user) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    if (!user.defaultWorkspace.allowImpersonation) {
      throw new AuthException(
        'Impersonation not allowed',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const accessToken = await this.accessTokenService.generateAccessToken(
      user.id,
      user.defaultWorkspaceId,
    );
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
      user.defaultWorkspaceId,
    );

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
}
