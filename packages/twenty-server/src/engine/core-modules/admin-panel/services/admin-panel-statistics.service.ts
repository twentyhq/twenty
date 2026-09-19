import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { type FullNameMetadata } from 'twenty-shared/types';
import { isWorkspaceProvisioned } from 'twenty-shared/workspace';
import { Brackets, In, IsNull, Repository } from 'typeorm';

import { type AdminPanelRecentUserDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-recent-user.dto';
import { type AdminPanelTopWorkspaceDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-top-workspace.dto';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const RECENT_USERS_LIMIT = 10;
const TOP_WORKSPACES_LIMIT = 10;
// Names live in a different table, so search is done in memory over a wider pool.
const RECENT_USERS_SEARCH_CANDIDATE_LIMIT = 200;

@Injectable()
export class AdminPanelStatisticsService {
  constructor(
    private readonly fileUrlService: FileUrlService,
    private readonly userService: UserService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async getRecentUsers(
    searchTerm?: string,
  ): Promise<AdminPanelRecentUserDTO[]> {
    const trimmedSearch = searchTerm?.trim();
    const hasSearch = isNonEmptyString(trimmedSearch);

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.userWorkspaces',
        'userWorkspace',
        '"userWorkspace"."deletedAt" IS NULL',
      )
      .leftJoinAndSelect(
        'userWorkspace.workspace',
        'workspace',
        '"workspace"."deletedAt" IS NULL',
      )
      .where({ deletedAt: IsNull() })
      .orderBy('user.createdAt', 'DESC')
      .addOrderBy('userWorkspace.createdAt', 'DESC')
      .take(
        hasSearch ? RECENT_USERS_SEARCH_CANDIDATE_LIMIT : RECENT_USERS_LIMIT,
      );

    const users = await queryBuilder.getMany();

    const [signedAvatarUrlByUserId, workspaceMemberNamesByUserId] =
      await Promise.all([
        this.buildSignedAvatarUrlByUserId(users),
        this.buildWorkspaceMemberNamesByUserId(users),
      ]);

    const recentUsers = await Promise.all(
      users.map(async (user) => {
        const displayWorkspace = user.userWorkspaces[0]?.workspace;
        // name is sourced from workspaceMember, not user
        const memberName = workspaceMemberNamesByUserId.get(user.id);
        return {
          id: user.id,
          email: user.email,
          firstName: memberName?.firstName ?? user.firstName ?? undefined,
          lastName: memberName?.lastName ?? user.lastName ?? undefined,
          createdAt: user.createdAt,
          avatarUrl: signedAvatarUrlByUserId.get(user.id) ?? null,
          workspaceName: displayWorkspace?.displayName ?? null,
          workspaceId: displayWorkspace?.id ?? null,
          workspaceLogo: displayWorkspace
            ? await this.fileUrlService.signWorkspaceLogoUrl(displayWorkspace)
            : null,
        };
      }),
    );

    if (!hasSearch) {
      return recentUsers;
    }

    const lowerCaseSearch = trimmedSearch.toLowerCase();

    return recentUsers
      .filter((user) => {
        const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`;

        return (
          user.email.toLowerCase().includes(lowerCaseSearch) ||
          user.id.toLowerCase().includes(lowerCaseSearch) ||
          fullName.toLowerCase().includes(lowerCaseSearch)
        );
      })
      .slice(0, RECENT_USERS_LIMIT);
  }

  async getTopWorkspaces(
    searchTerm?: string,
  ): Promise<AdminPanelTopWorkspaceDTO[]> {
    const trimmedSearch = searchTerm?.trim();

    const queryBuilder = this.workspaceRepository
      .createQueryBuilder('workspace')
      .leftJoin(
        'workspace.workspaceUsers',
        'userWorkspace',
        '"userWorkspace"."deletedAt" IS NULL',
      )
      .select('workspace.id', 'id')
      .addSelect('workspace.displayName', 'name')
      .addSelect('workspace.subdomain', 'subdomain')
      .addSelect('workspace.logoFileId', 'logoFileId')
      .addSelect('COUNT("userWorkspace"."id")::int', 'totalUsers')
      .where({ deletedAt: IsNull() })
      .groupBy('workspace.id')
      .orderBy('"totalUsers"', 'DESC')
      .limit(TOP_WORKSPACES_LIMIT);

    if (trimmedSearch && trimmedSearch.length > 0) {
      const like = `%${trimmedSearch}%`;

      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('"workspace"."displayName" ILIKE :like', { like })
            .orWhere('"workspace"."subdomain" ILIKE :like', { like })
            .orWhere('"workspace"."id"::text ILIKE :like', { like });
        }),
      );
    }

    const rows: Array<{
      id: string;
      name: string | null;
      subdomain: string | null;
      logoFileId: string | null;
      totalUsers: number;
    }> = await queryBuilder.getRawMany();

    return Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        logoUrl: await this.fileUrlService.signWorkspaceLogoUrl({
          id: row.id,
          logoFileId: row.logoFileId,
        }),
        name: row.name ?? '',
        subdomain: row.subdomain ?? '',
        totalUsers: row.totalUsers,
      })),
    );
  }

  // batches the name lookup by workspace.
  private async buildWorkspaceMemberNamesByUserId(
    users: UserEntity[],
  ): Promise<Map<string, FullNameMetadata>> {
    const namesByUserId = new Map<string, FullNameMetadata>();
    const userIdsByWorkspaceId = new Map<string, Set<string>>();

    for (const user of users) {
      const displayWorkspace = user.userWorkspaces[0]?.workspace;

      // skips if workspace is missing or not yet provisioned (postgress might throw schema may not exist error)
      if (!displayWorkspace || !isWorkspaceProvisioned(displayWorkspace)) {
        continue;
      }

      const userIds =
        userIdsByWorkspaceId.get(displayWorkspace.id) ?? new Set<string>();

      userIds.add(user.id);
      userIdsByWorkspaceId.set(displayWorkspace.id, userIds);
    }

    await Promise.all(
      Array.from(userIdsByWorkspaceId.entries()).map(
        async ([workspaceId, userIds]) => {
          const namesForWorkspace = await this.getWorkspaceMemberNamesByUserId(
            workspaceId,
            Array.from(userIds),
          );

          for (const userId of userIds) {
            const name = namesForWorkspace.get(userId);

            if (name) {
              namesByUserId.set(userId, name);
            }
          }
        },
      ),
    );

    return namesByUserId;
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

  private async buildSignedAvatarUrlByUserId(
    users: UserEntity[],
  ): Promise<Map<string, string | null>> {
    const signedAvatarUrlByUserId = new Map<string, string | null>();
    const contextsByWorkspaceId = new Map<
      string,
      {
        workspace: WorkspaceEntity;
        fallbackAvatarUrlsByUserId: Map<string, string | null>;
      }
    >();

    for (const user of users) {
      signedAvatarUrlByUserId.set(user.id, null);

      for (const userWorkspace of user.userWorkspaces) {
        const workspace = userWorkspace.workspace;

        if (!workspace) {
          continue;
        }

        const entry = contextsByWorkspaceId.get(workspace.id) ?? {
          workspace,
          fallbackAvatarUrlsByUserId: new Map(),
        };

        entry.fallbackAvatarUrlsByUserId.set(
          user.id,
          userWorkspace.defaultAvatarUrl ?? null,
        );
        contextsByWorkspaceId.set(workspace.id, entry);
      }
    }

    await Promise.all(
      Array.from(contextsByWorkspaceId.values()).map(
        async ({ workspace, fallbackAvatarUrlsByUserId }) => {
          const perWorkspaceSigned =
            await this.userService.loadSignedAvatarUrlsByUserId({
              workspace,
              fallbackAvatarUrlsByUserId,
            });

          for (const [userId, signedUrl] of perWorkspaceSigned.entries()) {
            const existing = signedAvatarUrlByUserId.get(userId);

            if (!isNonEmptyString(existing) && isNonEmptyString(signedUrl)) {
              signedAvatarUrlByUserId.set(userId, signedUrl);
            }
          }
        },
      ),
    );

    return signedAvatarUrlByUserId;
  }
}
