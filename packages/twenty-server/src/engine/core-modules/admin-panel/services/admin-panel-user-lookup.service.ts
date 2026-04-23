import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { FeatureFlagKey, FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { type UserLookup } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.dto';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class AdminPanelUserLookupService {
  constructor(
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly fileUrlService: FileUrlService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(FeatureFlagEntity)
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  private signAvatarUrl({
    avatarUrl,
    workspaceId,
  }: {
    avatarUrl?: string | null;
    workspaceId: string;
  }): string | null {
    if (!avatarUrl) {
      return null;
    }

    const fileId = extractFileIdFromUrl(avatarUrl, FileFolder.CorePicture);

    if (!isDefined(fileId)) {
      return avatarUrl;
    }

    return this.fileUrlService.signFileByIdUrl({
      fileId,
      workspaceId,
      fileFolder: FileFolder.CorePicture,
    });
  }

  private async loadWorkspaceMemberAvatarUrls({
    workspaceId,
    workspaceUsers,
  }: {
    workspaceId: string;
    workspaceUsers: UserWorkspaceEntity[];
  }): Promise<Map<string, string | null>> {
    const definedWorkspaceUsers = workspaceUsers.filter((workspaceUser) =>
      isDefined(workspaceUser.user),
    );

    const userIds = definedWorkspaceUsers.map(
      (workspaceUser) => workspaceUser.user.id,
    );

    if (userIds.length === 0) {
      return new Map();
    }

    const authContext = buildSystemAuthContext(workspaceId);

    try {
      return await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const workspaceMemberRepository =
            await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
              workspaceId,
              'workspaceMember',
              { shouldBypassPermissionChecks: true },
            );

          const workspaceMembers = await workspaceMemberRepository.find({
            select: ['userId', 'avatarUrl'],
            where: {
              userId: In(userIds),
            },
          });

          const workspaceMemberAvatarUrlsByUserId = new Map(
            workspaceMembers.map((workspaceMember) => [
              workspaceMember.userId,
              this.signAvatarUrl({
                avatarUrl: workspaceMember.avatarUrl,
                workspaceId,
              }),
            ]),
          );

          const fallbackAvatarUrlsByUserId = new Map(
            definedWorkspaceUsers.map((workspaceUser) => [
              workspaceUser.user.id,
              this.signAvatarUrl({
                avatarUrl:
                  workspaceUser.defaultAvatarUrl ??
                  workspaceUser.user.defaultAvatarUrl,
                workspaceId,
              }),
            ]),
          );

          return new Map(
            userIds.map((userId) => [
              userId,
              workspaceMemberAvatarUrlsByUserId.get(userId) ??
                fallbackAvatarUrlsByUserId.get(userId) ??
                null,
            ]),
          );
        },
        authContext,
      );
    } catch {
      return new Map(
        definedWorkspaceUsers.map((workspaceUser) => [
          workspaceUser.user.id,
          this.signAvatarUrl({
            avatarUrl:
              workspaceUser.defaultAvatarUrl ??
              workspaceUser.user.defaultAvatarUrl,
            workspaceId,
          }),
        ]),
      );
    }
  }

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

    const workspaces = await Promise.all(
      targetUser.userWorkspaces.map(async (userWorkspace) => {
        const workspaceUsers = userWorkspace.workspace.workspaceUsers.filter(
          (workspaceUser) => isDefined(workspaceUser.user),
        );
        const avatarUrlsByUserId = await this.loadWorkspaceMemberAvatarUrls({
          workspaceId: userWorkspace.workspace.id,
          workspaceUsers,
        });

        return {
          id: userWorkspace.workspace.id,
          name: userWorkspace.workspace.displayName ?? '',
          totalUsers: workspaceUsers.length,
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
            isCustomDomainEnabled:
              userWorkspace.workspace.isCustomDomainEnabled,
          }),
          users: workspaceUsers.map((workspaceUser) => ({
            id: workspaceUser.user.id,
            email: workspaceUser.user.email,
            firstName: workspaceUser.user.firstName,
            lastName: workspaceUser.user.lastName,
            avatarUrl: avatarUrlsByUserId.get(workspaceUser.user.id) ?? null,
            createdAt: workspaceUser.user.createdAt,
          })),
          featureFlags: allFeatureFlagKeys.map((key) => ({
            key,
            value:
              userWorkspace.workspace.featureFlags?.find(
                (flag) => flag.key === key,
              )?.value ?? false,
          })),
        };
      }),
    );

    return {
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        createdAt: targetUser.createdAt,
      },
      workspaces,
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
    const definedWorkspaceUsers = workspaceUsers.filter((wu) =>
      isDefined(wu.user),
    );
    const avatarUrlsByUserId = await this.loadWorkspaceMemberAvatarUrls({
      workspaceId,
      workspaceUsers: definedWorkspaceUsers,
    });

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
      users: definedWorkspaceUsers.map((wu) => ({
        id: wu.user.id,
        email: wu.user.email,
        firstName: wu.user.firstName,
        lastName: wu.user.lastName,
        avatarUrl: avatarUrlsByUserId.get(wu.user.id) ?? null,
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
        avatarUrl: firstUser
          ? (avatarUrlsByUserId.get(firstUser.id) ?? null)
          : null,
        createdAt: firstUser?.createdAt ?? new Date(),
      },
      workspaces: [workspaceInfo],
    };
  }
}
