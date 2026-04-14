import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { FeatureFlagKey, FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type UserLookup } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.dto';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class AdminPanelUserLookupService {
  constructor(
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly fileUrlService: FileUrlService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(FeatureFlagEntity)
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async userLookup(userIdentifier: string): Promise<UserLookup> {
    const isEmail = userIdentifier.includes('@');
    const normalizedIdentifier = isEmail
      ? userIdentifier.toLowerCase()
      : userIdentifier;

    const targetUser = await this.userRepository.findOne({
      where: isEmail
        ? { email: normalizedIdentifier }
        : { id: normalizedIdentifier },
      relations: {
        userWorkspaces: {
          workspace: {
            workspaceUsers: {
              user: true,
            },
            featureFlags: true,
          },
        },
      },
    });

    userValidator.assertIsDefinedOrThrow(
      targetUser,
      new AuthException('User not found', AuthExceptionCode.INVALID_INPUT, {
        userFriendlyMessage: msg`User not found. Please check the email or ID.`,
      }),
    );

    const allFeatureFlagKeys = Object.values(FeatureFlagKey);

    return {
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        createdAt: targetUser.createdAt,
      },
      workspaces: targetUser.userWorkspaces.map((userWorkspace) => ({
        id: userWorkspace.workspace.id,
        name: userWorkspace.workspace.displayName ?? '',
        totalUsers: userWorkspace.workspace.workspaceUsers.length,
        activationStatus: userWorkspace.workspace.activationStatus,
        createdAt: userWorkspace.workspace.createdAt,
        logo: isDefined(userWorkspace.workspace.logoFileId)
          ? this.fileUrlService.signFileByIdUrl({
              fileId: userWorkspace.workspace.logoFileId,
              workspaceId: userWorkspace.workspace.id,
              fileFolder: FileFolder.CorePicture,
            })
          : undefined,
        allowImpersonation: userWorkspace.workspace.allowImpersonation,
        workspaceUrls: this.workspaceDomainsService.getWorkspaceUrls({
          subdomain: userWorkspace.workspace.subdomain,
          customDomain: userWorkspace.workspace.customDomain,
          isCustomDomainEnabled: userWorkspace.workspace.isCustomDomainEnabled,
        }),
        users: userWorkspace.workspace.workspaceUsers
          .filter((workspaceUser) => isDefined(workspaceUser.user))
          .map((workspaceUser) => ({
            id: workspaceUser.user.id,
            email: workspaceUser.user.email,
            firstName: workspaceUser.user.firstName,
            lastName: workspaceUser.user.lastName,
            createdAt: workspaceUser.user.createdAt,
          })),
        featureFlags: allFeatureFlagKeys.map((key) => ({
          key,
          value:
            userWorkspace.workspace.featureFlags?.find(
              (flag) => flag.key === key,
            )?.value ?? false,
        })),
      })),
    };
  }

  async workspaceLookup(workspaceId: string): Promise<UserLookup> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new AuthException(
        'Workspace not found',
        AuthExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`Workspace not found. Please check the ID.`,
        },
      );
    }

    const [workspaceUsers, featureFlags] = await Promise.all([
      this.userWorkspaceRepository.find({
        where: { workspaceId },
        relations: { user: true },
      }),
      this.featureFlagRepository.find({
        where: { workspaceId },
      }),
    ]);

    const allFeatureFlagKeys = Object.values(FeatureFlagKey);

    const workspaceInfo = {
      id: workspace.id,
      name: workspace.displayName ?? '',
      totalUsers: workspaceUsers.length,
      activationStatus: workspace.activationStatus,
      createdAt: workspace.createdAt,
      logo: isDefined(workspace.logoFileId)
        ? this.fileUrlService.signFileByIdUrl({
            fileId: workspace.logoFileId,
            workspaceId: workspace.id,
            fileFolder: FileFolder.CorePicture,
          })
        : undefined,
      allowImpersonation: workspace.allowImpersonation,
      workspaceUrls: this.workspaceDomainsService.getWorkspaceUrls({
        subdomain: workspace.subdomain,
        customDomain: workspace.customDomain,
        isCustomDomainEnabled: workspace.isCustomDomainEnabled,
      }),
      users: workspaceUsers
        .filter((wu) => isDefined(wu.user))
        .map((wu) => ({
          id: wu.user.id,
          email: wu.user.email,
          firstName: wu.user.firstName,
          lastName: wu.user.lastName,
          createdAt: wu.user.createdAt,
        })),
      featureFlags: allFeatureFlagKeys.map((key) => ({
        key,
        value: featureFlags.find((flag) => flag.key === key)?.value ?? false,
      })),
    };

    const firstUser = workspaceUsers.find((wu) => isDefined(wu.user))?.user;

    return {
      user: {
        id: firstUser?.id ?? '',
        email: firstUser?.email ?? '',
        firstName: firstUser?.firstName,
        lastName: firstUser?.lastName,
        createdAt: firstUser?.createdAt ?? new Date(),
      },
      workspaces: [workspaceInfo],
    };
  }
}
