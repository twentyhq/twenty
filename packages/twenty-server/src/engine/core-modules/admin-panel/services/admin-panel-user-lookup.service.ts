import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { FeatureFlagKey, type FullNameMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isWorkspaceProvisioned } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

import { type UserLookup } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.dto';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { userValidator } from 'src/engine/core-modules/user/user.validate';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
@Injectable()
export class AdminPanelUserLookupService {
  constructor(
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly fileUrlService: FileUrlService,
    private readonly userService: UserService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectWorkspaceScopedRepository(FeatureFlagEntity)
    private readonly featureFlagRepository: WorkspaceScopedRepository<FeatureFlagEntity>,
  ) {}

  private buildFallbackAvatarUrlsByUserId(
    workspaceUsers: UserWorkspaceEntity[],
  ): Map<string, string | null> {
    return new Map(
      workspaceUsers
        .filter((workspaceUser) => isDefined(workspaceUser.user))
        .map((workspaceUser) => [
          workspaceUser.user.id,
          workspaceUser.defaultAvatarUrl ?? null,
        ]),
    );
  }

  // Fetches names only for the given users.
  private async getWorkspaceMemberNamesByUserId(
    workspaceId: string,
    userIds: string[],
  ): Promise<Map<string, FullNameMetadata>> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        const workspaceMembers = await workspaceMemberRepository.find({
          where: { userId: In(userIds) },
        });

        return new Map(
          workspaceMembers.map((workspaceMember) => [
            workspaceMember.userId,
            workspaceMember.name,
          ]),
        );
      },
      authContext,
    );
  }

  // Skip if workspace is missing or not yet provisioned (schema may not exist).
  private async getWorkspaceMemberNamesIfProvisioned(
    workspace: Pick<WorkspaceEntity, 'id' | 'activationStatus'> | undefined,
    userIds: string[],
  ): Promise<Map<string, FullNameMetadata>> {
    if (
      !workspace ||
      !isWorkspaceProvisioned(workspace) ||
      userIds.length === 0
    ) {
      return new Map();
    }

    return this.getWorkspaceMemberNamesByUserId(workspace.id, userIds);
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

    const workspaceResults = await Promise.all(
      targetUser.userWorkspaces.map(async (userWorkspace) => {
        const workspaceUsers = userWorkspace.workspace.workspaceUsers.filter(
          (workspaceUser) => isDefined(workspaceUser.user),
        );
        const [avatarUrlsByUserId, namesByUserId] = await Promise.all([
          this.userService.loadSignedAvatarUrlsByUserId({
            workspace: userWorkspace.workspace,
            fallbackAvatarUrlsByUserId:
              this.buildFallbackAvatarUrlsByUserId(workspaceUsers),
          }),
          this.getWorkspaceMemberNamesIfProvisioned(
            userWorkspace.workspace,
            workspaceUsers.map((workspaceUser) => workspaceUser.user.id),
          ),
        ]);

        return {
          targetUserName: namesByUserId.get(targetUser.id),
          workspace: {
            id: userWorkspace.workspace.id,
            name: userWorkspace.workspace.displayName ?? '',
            totalUsers: workspaceUsers.length,
            activationStatus: userWorkspace.workspace.activationStatus,
            createdAt: userWorkspace.workspace.createdAt,
            logo:
              (await this.fileUrlService.signWorkspaceLogoUrl(
                userWorkspace.workspace,
              )) ?? undefined,
            allowImpersonation: userWorkspace.workspace.allowImpersonation,
            workspaceUrls: this.workspaceDomainsService.getWorkspaceUrls({
              subdomain: userWorkspace.workspace.subdomain,
              customDomain: userWorkspace.workspace.customDomain,
              isCustomDomainEnabled:
                userWorkspace.workspace.isCustomDomainEnabled,
            }),
            users: workspaceUsers.map((workspaceUser) => {
              const memberName = namesByUserId.get(workspaceUser.user.id);

              return {
                id: workspaceUser.user.id,
                email: workspaceUser.user.email,
                // Name is sourced from workspaceMember, not user.
                firstName:
                  memberName?.firstName ?? workspaceUser.user.firstName,
                lastName: memberName?.lastName ?? workspaceUser.user.lastName,
                avatarUrl:
                  avatarUrlsByUserId.get(workspaceUser.user.id) ?? null,
                createdAt: workspaceUser.user.createdAt,
              };
            }),
            featureFlags: allFeatureFlagKeys.map((key) => ({
              key,
              value:
                userWorkspace.workspace.featureFlags?.find(
                  (flag) => flag.key === key,
                )?.value ?? false,
            })),
          },
        };
      }),
    );

    const resolvedTargetUserName = workspaceResults.find((result) =>
      isDefined(result.targetUserName),
    )?.targetUserName;

    return {
      user: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: resolvedTargetUserName?.firstName ?? targetUser.firstName,
        lastName: resolvedTargetUserName?.lastName ?? targetUser.lastName,
        createdAt: targetUser.createdAt,
      },
      workspaces: workspaceResults.map((result) => result.workspace),
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
      this.featureFlagRepository.find(workspaceId),
    ]);

    const allFeatureFlagKeys = Object.values(FeatureFlagKey);
    const definedWorkspaceUsers = workspaceUsers.filter((wu) =>
      isDefined(wu.user),
    );
    const [avatarUrlsByUserId, namesByUserId] = await Promise.all([
      this.userService.loadSignedAvatarUrlsByUserId({
        workspace,
        fallbackAvatarUrlsByUserId: this.buildFallbackAvatarUrlsByUserId(
          definedWorkspaceUsers,
        ),
      }),
      this.getWorkspaceMemberNamesIfProvisioned(
        workspace,
        definedWorkspaceUsers.map((wu) => wu.user.id),
      ),
    ]);

    const workspaceInfo = {
      id: workspace.id,
      name: workspace.displayName ?? '',
      totalUsers: workspaceUsers.length,
      activationStatus: workspace.activationStatus,
      createdAt: workspace.createdAt,
      logo:
        (await this.fileUrlService.signWorkspaceLogoUrl(workspace)) ??
        undefined,
      allowImpersonation: workspace.allowImpersonation,
      workspaceUrls: this.workspaceDomainsService.getWorkspaceUrls({
        subdomain: workspace.subdomain,
        customDomain: workspace.customDomain,
        isCustomDomainEnabled: workspace.isCustomDomainEnabled,
      }),
      users: definedWorkspaceUsers.map((wu) => {
        const memberName = namesByUserId.get(wu.user.id);

        return {
          id: wu.user.id,
          email: wu.user.email,
          firstName: memberName?.firstName ?? wu.user.firstName,
          lastName: memberName?.lastName ?? wu.user.lastName,
          avatarUrl: avatarUrlsByUserId.get(wu.user.id) ?? null,
          createdAt: wu.user.createdAt,
        };
      }),
      featureFlags: allFeatureFlagKeys.map((key) => ({
        key,
        value: featureFlags.find((flag) => flag.key === key)?.value ?? false,
      })),
    };

    const firstUser = workspaceUsers.find((wu) => isDefined(wu.user))?.user;
    const firstUserName = isDefined(firstUser)
      ? namesByUserId.get(firstUser.id)
      : undefined;

    return {
      user: isDefined(firstUser)
        ? {
            id: firstUser.id,
            email: firstUser.email,
            firstName: firstUserName?.firstName ?? firstUser.firstName,
            lastName: firstUserName?.lastName ?? firstUser.lastName,
            avatarUrl: avatarUrlsByUserId.get(firstUser.id) ?? null,
            createdAt: firstUser.createdAt,
          }
        : null,
      workspaces: [workspaceInfo],
    };
  }
}
