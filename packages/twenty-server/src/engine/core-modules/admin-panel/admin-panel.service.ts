import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserLookup } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.entity';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class AdminPanelService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
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

  async userLookup(
    userIdentifier: string,
    userImpersonating: User,
  ): Promise<UserLookup> {
    if (!userImpersonating.canImpersonate) {
      throw new AuthException(
        'User cannot access user info',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const isEmail = userIdentifier.includes('@');

    const targetUser = await this.userRepository.findOne({
      where: isEmail ? { email: userIdentifier } : { id: userIdentifier },
      relations: [
        'workspaces',
        'workspaces.workspace',
        'workspaces.workspace.workspaceUsers',
        'workspaces.workspace.workspaceUsers.user',
        'workspaces.workspace.featureFlags',
      ],
    });

    if (!targetUser) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const allFeatureFlagKeys = Object.values(FeatureFlagKey);

    return {
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
      },
      workspaces: targetUser.workspaces.map((userWorkspace) => ({
        id: userWorkspace.workspace.id,
        name: userWorkspace.workspace.displayName ?? '',
        totalUsers: userWorkspace.workspace.workspaceUsers.length,
        logo: userWorkspace.workspace.logo,
        users: userWorkspace.workspace.workspaceUsers.map((workspaceUser) => ({
          id: workspaceUser.user.id,
          email: workspaceUser.user.email,
          firstName: workspaceUser.user.firstName,
          lastName: workspaceUser.user.lastName,
        })),
        featureFlags: allFeatureFlagKeys.map((key) => ({
          key,
          value:
            userWorkspace.workspace.featureFlags?.find(
              (flag) => flag.key === key,
            )?.value ?? false,
        })) as FeatureFlagEntity[],
      })),
    };
  }

  async updateWorkspaceFeatureFlags(
    workspaceId: string,
    featureFlag: FeatureFlagKey,
    userImpersonating: User,
    value: boolean,
  ) {
    if (!userImpersonating.canImpersonate) {
      throw new AuthException(
        'User cannot update feature flags',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['featureFlags'],
    });

    if (!workspace) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.INVALID_INPUT,
      );
    }

    const existingFlag = workspace.featureFlags?.find(
      (flag) => flag.key === featureFlag,
    );

    if (existingFlag) {
      await this.featureFlagRepository.update(existingFlag.id, { value });
    } else {
      await this.featureFlagRepository.save({
        key: featureFlag,
        value,
        workspaceId: workspace.id,
      });
    }
  }
}
