import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AuthTokens } from 'src/engine/core-modules/auth/dto/token.entity';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthProviders } from 'src/engine/core-modules/workspace/dtos/public-workspace-data.output';
import { getAuthProvidersByWorkspace } from 'src/engine/core-modules/workspace/utils/get-auth-providers-by-workspace.util';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

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
    private readonly environmentService: EnvironmentService,
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

    const systemEnabledProviders: AuthProviders = {
      google: this.environmentService.get('AUTH_GOOGLE_ENABLED'),
      magicLink: false,
      password: this.environmentService.get('AUTH_PASSWORD_ENABLED'),
      microsoft: this.environmentService.get('AUTH_MICROSOFT_ENABLED'),
      sso: [],
    };

    return {
      id: workspace.id,
      subdomain: workspace.subdomain,
      logo: workspace.logo,
      displayName: workspace.displayName,
      authProviders: getAuthProvidersByWorkspace({
        workspace,
        systemEnabledProviders,
      }),
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
