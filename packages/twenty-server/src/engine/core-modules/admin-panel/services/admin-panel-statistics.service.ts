import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Brackets, ILike, IsNull, Repository } from 'typeorm';

import { type AdminPanelRecentUserDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-recent-user.dto';
import { type AdminPanelTopWorkspaceDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-top-workspace.dto';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const RECENT_USERS_LIMIT = 10;
const TOP_WORKSPACES_LIMIT = 10;

@Injectable()
export class AdminPanelStatisticsService {
  constructor(
    private readonly fileUrlService: FileUrlService,
    private readonly userService: UserService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async getRecentUsers(
    searchTerm?: string,
  ): Promise<AdminPanelRecentUserDTO[]> {
    const trimmedSearch = searchTerm?.trim();

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
      .take(RECENT_USERS_LIMIT);

    if (trimmedSearch && trimmedSearch.length > 0) {
      const like = `%${trimmedSearch}%`;

      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where({ email: ILike(like) })
            .orWhere(
              `CONCAT("user"."firstName", ' ', "user"."lastName") ILIKE :like`,
              { like },
            )
            .orWhere('"user"."id"::text ILIKE :like', { like });
        }),
      );
    }

    const users = await queryBuilder.getMany();

    const signedAvatarUrlByUserId =
      await this.buildSignedAvatarUrlByUserId(users);

    return users.map((user) => {
      const displayWorkspace = user.userWorkspaces[0]?.workspace;

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        createdAt: user.createdAt,
        avatarUrl: signedAvatarUrlByUserId.get(user.id) ?? null,
        workspaceName: displayWorkspace?.displayName ?? null,
        workspaceId: displayWorkspace?.id ?? null,
        workspaceLogo: displayWorkspace
          ? this.fileUrlService.signWorkspaceLogoUrl(displayWorkspace)
          : null,
      };
    });
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

    return rows.map((row) => ({
      id: row.id,
      logoUrl: this.fileUrlService.signWorkspaceLogoUrl({
        id: row.id,
        logoFileId: row.logoFileId,
      }),
      name: row.name ?? '',
      subdomain: row.subdomain ?? '',
      totalUsers: row.totalUsers,
    }));
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
