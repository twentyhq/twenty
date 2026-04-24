import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { In, Repository } from 'typeorm';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AdminPanelRecentUserDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-recent-user.dto';
import { type AdminPanelTopWorkspaceDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-top-workspace.dto';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { WorkspaceMemberTranspiler } from 'src/engine/core-modules/user/services/workspace-member-transpiler.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

type RecentUserRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  avatarUrl: string | null;
  workspaceName: string | null;
  workspaceId: string | null;
  workspaceLogoFileId: string | null;
};

@Injectable()
export class AdminPanelStatisticsService {
  constructor(
    private readonly fileUrlService: FileUrlService,
    private readonly userService: UserService,
    private readonly workspaceMemberTranspiler: WorkspaceMemberTranspiler,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async getRecentUsers(
    searchTerm?: string,
  ): Promise<AdminPanelRecentUserDTO[]> {
    let whereClause = 'u."deletedAt" IS NULL';
    const params: unknown[] = [];

    if (searchTerm && searchTerm.trim().length > 0) {
      const term = `%${searchTerm.trim()}%`;

      whereClause += ` AND (u.email ILIKE $1 OR CONCAT(u."firstName", ' ', u."lastName") ILIKE $1 OR u.id::text ILIKE $1)`;
      params.push(term);
    }

    const results = (await this.userRepository.manager.query(
      `SELECT * FROM (
         SELECT DISTINCT ON (u.id) u.id, u.email, u."firstName", u."lastName", u."createdAt",
                COALESCE(NULLIF(uw."defaultAvatarUrl", ''), NULLIF(u."defaultAvatarUrl", '')) AS "avatarUrl",
                w."displayName" AS "workspaceName", w.id AS "workspaceId", w."logoFileId" AS "workspaceLogoFileId"
         FROM core."user" u
         LEFT JOIN core."userWorkspace" uw ON uw."userId" = u.id AND uw."deletedAt" IS NULL
         LEFT JOIN core.workspace w ON w.id = uw."workspaceId" AND w."deletedAt" IS NULL
         WHERE ${whereClause}
         ORDER BY u.id, uw."createdAt" DESC NULLS LAST, u."createdAt" DESC
       ) sub
       ORDER BY sub."createdAt" DESC
       LIMIT 10`,
      params,
    )) as RecentUserRow[];

    const signedAvatarByUserId =
      await this.loadSignedAvatarUrlsByUserId(results);

    return results.map((row) => ({
      id: row.id,
      email: row.email,
      firstName: row.firstName ?? undefined,
      lastName: row.lastName ?? undefined,
      createdAt: row.createdAt,
      avatarUrl: signedAvatarByUserId.get(row.id) ?? null,
      workspaceName: row.workspaceName ?? null,
      workspaceId: row.workspaceId ?? null,
      workspaceLogo:
        row.workspaceId && row.workspaceLogoFileId
          ? this.fileUrlService.signFileByIdUrl({
              fileId: row.workspaceLogoFileId,
              workspaceId: row.workspaceId,
              fileFolder: FileFolder.CorePicture,
            })
          : null,
    }));
  }

  async getTopWorkspaces(
    searchTerm?: string,
  ): Promise<AdminPanelTopWorkspaceDTO[]> {
    let whereClause = 'w."deletedAt" IS NULL';
    const params: unknown[] = [];

    if (searchTerm && searchTerm.trim().length > 0) {
      const term = `%${searchTerm.trim()}%`;

      whereClause += ` AND (w."displayName" ILIKE $1 OR w.subdomain ILIKE $1 OR w.id::text ILIKE $1)`;
      params.push(term);
    }

    const results: Array<{
      id: string;
      name: string;
      subdomain: string;
      logoFileId: string | null;
      totalUsers: number;
    }> = await this.workspaceRepository.manager.query(
      `SELECT w.id, w."displayName" AS name, w.subdomain, w."logoFileId", COUNT(uw.id)::int AS "totalUsers"
       FROM core.workspace w
       LEFT JOIN core."userWorkspace" uw ON uw."workspaceId" = w.id AND uw."deletedAt" IS NULL
       WHERE ${whereClause}
       GROUP BY w.id
       ORDER BY "totalUsers" DESC
       LIMIT 10`,
      params,
    );

    return results.map((row) => ({
      id: row.id,
      logo: isDefined(row.logoFileId)
        ? this.fileUrlService.signFileByIdUrl({
            fileId: row.logoFileId,
            workspaceId: row.id,
            fileFolder: FileFolder.CorePicture,
          })
        : null,
      name: row.name ?? '',
      subdomain: row.subdomain ?? '',
      totalUsers: row.totalUsers,
    }));
  }

  private async loadSignedAvatarUrlsByUserId(
    rows: RecentUserRow[],
  ): Promise<Map<string, string | null>> {
    const signedAvatarByUserId = new Map<string, string | null>();
    const rowsByWorkspaceId = new Map<string, RecentUserRow[]>();

    for (const row of rows) {
      if (!isDefined(row.workspaceId)) {
        signedAvatarByUserId.set(row.id, null);
        continue;
      }
      const list = rowsByWorkspaceId.get(row.workspaceId) ?? [];

      list.push(row);
      rowsByWorkspaceId.set(row.workspaceId, list);
    }

    if (rowsByWorkspaceId.size === 0) {
      return signedAvatarByUserId;
    }

    const workspaces = await this.workspaceRepository.find({
      select: { id: true, activationStatus: true },
      where: { id: In(Array.from(rowsByWorkspaceId.keys())) },
    });
    const workspaceById = new Map(workspaces.map((w) => [w.id, w]));

    for (const [workspaceId, workspaceRows] of rowsByWorkspaceId.entries()) {
      const workspace = workspaceById.get(workspaceId);

      if (!isDefined(workspace)) {
        for (const row of workspaceRows) {
          signedAvatarByUserId.set(row.id, null);
        }
        continue;
      }

      const workspaceMembers =
        await this.userService.loadWorkspaceMembersByUserIds({
          workspace,
          userIds: workspaceRows.map((row) => row.id),
        });
      const workspaceMemberByUserId = new Map(
        workspaceMembers.map((member) => [member.userId, member]),
      );

      for (const row of workspaceRows) {
        const member = workspaceMemberByUserId.get(row.id);
        const memberSigned = isDefined(member)
          ? this.workspaceMemberTranspiler.generateSignedAvatarUrl({
              workspaceId,
              workspaceMember: member,
            })
          : '';

        if (isNonEmptyString(memberSigned)) {
          signedAvatarByUserId.set(row.id, memberSigned);
          continue;
        }

        if (!isNonEmptyString(row.avatarUrl)) {
          signedAvatarByUserId.set(row.id, null);
          continue;
        }

        const fallbackSigned =
          this.workspaceMemberTranspiler.generateSignedAvatarUrl({
            workspaceId,
            workspaceMember: { avatarUrl: row.avatarUrl, id: row.id },
          });

        signedAvatarByUserId.set(
          row.id,
          isNonEmptyString(fallbackSigned) ? fallbackSigned : null,
        );
      }
    }

    return signedAvatarByUserId;
  }
}
