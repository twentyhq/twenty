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
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthTokens } from 'src/engine/core-modules/auth/dto/token.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { getAuthProvidersByWorkspace } from 'src/engine/core-modules/workspace/utils/getAuthProvidersByWorkspace';

@Injectable()
export class SwitchWorkspaceService {
  constructor(
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly userService: UserService,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async switchWorkspace(user: User, workspaceId: string) {
    const userExists = await this.userRepository.findBy({ id: user.id });

    if (!userExists) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['workspaceUsers', 'workspaceSSOIdentityProviders'],
    });

    if (!workspace) {
      throw new AuthException(
        'workspace doesnt exist',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    if (
      !workspace.workspaceUsers
        .map((userWorkspace) => userWorkspace.userId)
        .includes(user.id)
    ) {
      throw new AuthException(
        'user does not belong to workspace',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    await this.userRepository.save({
      id: user.id,
      defaultWorkspace: workspace,
    });

    return {
      id: workspace.id,
      subdomain: workspace.subdomain,
      logo: workspace.logo,
      displayName: workspace.displayName,
      authProviders: getAuthProvidersByWorkspace(workspace),
    };
  }

  async generateSwitchWorkspaceToken(
    user: User,
    workspace: Workspace,
  ): Promise<AuthTokens> {
    await this.userService.saveDefaultWorkspaceIfUserHasAccessOrThrow(
      user.id,
      workspace.id,
    );

    const token = await this.accessTokenService.generateAccessToken(
      user.id,
      workspace.id,
    );
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
      workspace.id,
    );

    return {
      tokens: {
        accessToken: token,
        refreshToken,
      },
    };
  }
}
