import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { FileFolder } from 'twenty-shared/types';

import { type AdminPanelRecentUserDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-recent-user.dto';
import { type AdminPanelTopWorkspaceDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-top-workspace.dto';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class AdminPanelStatisticsService {
  constructor(
    private readonly fileUrlService: FileUrlService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  private signAvatarUrl({
    avatarUrl,
    workspaceId,
  }: {
    avatarUrl?: string | null;
    workspaceId?: string | null;
  }): string | null {
    if (!avatarUrl) {
      return null;
    }

    if (!workspaceId) {
      return avatarUrl;
    }

    const fileId = extractFileIdFromUrl(avatarUrl, FileFolder.CorePicture);

    if (!fileId) {
      return avatarUrl;
    }

    return this.fileUrlService.signFileByIdUrl({
      fileId,
      workspaceId,
      fileFolder: FileFolder.CorePicture,
    });
  }

  private signWorkspaceLogo({
    logoFileId,
    workspaceId,
  }: {
    logoFileId?: string | null;
    workspaceId: string;
  }): string | null {
    if (!logoFileId) {
      return null;
    }

    return this.fileUrlService.signFileByIdUrl({
      fileId: logoFileId,
      workspaceId,
      fileFolder: FileFolder.CorePicture,
    });
  }

  private async loadWorkspaceMemberAvatarUrl({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId?: string | null;
  }): Promise<string | null> {
    if (!workspaceId) {
      return null;
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

          const workspaceMember = await workspaceMemberRepository.findOne({
            where: { userId },
            select: ['avatarUrl'],
          });

          return workspaceMember?.avatarUrl ?? null;
        },
        authContext,
      );
    } catch {
      return null;
    }
  }

  private async loadPreferredAvatarUrlsByUserId(
    users: Array<{
      userId: string;
      avatarUrl: string | null;
      workspaceId: string | null;
    }>,
  ): Promise<Map<string, string | null>> {
    if (users.length === 0) {
      return new Map();
    }

    const userWorkspaceRows = await this.userRepository.manager.query(
      `SELECT uw."userId", uw."workspaceId",
              COALESCE(NULLIF(uw."defaultAvatarUrl", ''), NULLIF(u."defaultAvatarUrl", '')) AS "avatarUrl"
       FROM core."userWorkspace" uw
       LEFT JOIN core."user" u ON u.id = uw."userId"
       WHERE uw."deletedAt" IS NULL
         AND uw."userId" = ANY($1::uuid[])
       ORDER BY uw."userId", uw."createdAt" DESC NULLS LAST`,
      [users.map(({ userId }) => userId)],
    );

    const preferredAvatarUrlsByUserId = new Map<string, string | null>();
    const fallbackAvatarUrlsByUserId = new Map<string, string | null>();

    const workspaceMemberAvatarRows = await Promise.all(
      userWorkspaceRows.map(
        async (row: {
          userId: string;
          workspaceId: string | null;
          avatarUrl: string | null;
        }) => ({
          userId: row.userId,
          workspaceId: row.workspaceId,
          workspaceMemberAvatarUrl: await this.loadWorkspaceMemberAvatarUrl({
            userId: row.userId,
            workspaceId: row.workspaceId,
          }),
          fallbackAvatarUrl: row.avatarUrl,
        }),
      ),
    );

    for (const row of workspaceMemberAvatarRows) {
      if (
        !preferredAvatarUrlsByUserId.has(row.userId) &&
        row.workspaceMemberAvatarUrl
      ) {
        preferredAvatarUrlsByUserId.set(
          row.userId,
          this.signAvatarUrl({
            avatarUrl: row.workspaceMemberAvatarUrl,
            workspaceId: row.workspaceId,
          }),
        );
      }

      if (
        !fallbackAvatarUrlsByUserId.has(row.userId) &&
        row.fallbackAvatarUrl
      ) {
        fallbackAvatarUrlsByUserId.set(
          row.userId,
          this.signAvatarUrl({
            avatarUrl: row.fallbackAvatarUrl,
            workspaceId: row.workspaceId,
          }),
        );
      }
    }

    for (const user of users) {
      if (preferredAvatarUrlsByUserId.has(user.userId)) {
        continue;
      }

      if (fallbackAvatarUrlsByUserId.has(user.userId)) {
        preferredAvatarUrlsByUserId.set(
          user.userId,
          fallbackAvatarUrlsByUserId.get(user.userId) ?? null,
        );

        continue;
      }

      preferredAvatarUrlsByUserId.set(
        user.userId,
        this.signAvatarUrl({
          avatarUrl: user.avatarUrl,
          workspaceId: user.workspaceId,
        }),
      );
    }

    return preferredAvatarUrlsByUserId;
  }

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

    const results = await this.userRepository.manager.query(
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
    );

    const preferredAvatarUrlsByUserId =
      await this.loadPreferredAvatarUrlsByUserId(
        results.map(
          (row: {
            id: string;
            avatarUrl: string | null;
            workspaceId: string | null;
          }) => ({
            userId: row.id,
            avatarUrl: row.avatarUrl,
            workspaceId: row.workspaceId,
          }),
        ),
      );

    return results.map(
      (row: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        createdAt: Date;
        avatarUrl: string | null;
        workspaceName: string | null;
        workspaceId: string | null;
        workspaceLogoFileId: string | null;
      }) => ({
        id: row.id,
        email: row.email,
        firstName: row.firstName || null,
        lastName: row.lastName || null,
        createdAt: row.createdAt,
        avatarUrl: preferredAvatarUrlsByUserId.get(row.id) ?? null,
        workspaceName: row.workspaceName ?? null,
        workspaceId: row.workspaceId ?? null,
        workspaceLogoUrl: row.workspaceId
          ? this.signWorkspaceLogo({
              logoFileId: row.workspaceLogoFileId,
              workspaceId: row.workspaceId,
            })
          : null,
      }),
    );
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

    const results = await this.workspaceRepository.manager.query(
      `SELECT w.id, w."displayName" AS name, w.subdomain, w."logoFileId", COUNT(uw.id)::int AS "totalUsers"
       FROM core.workspace w
       LEFT JOIN core."userWorkspace" uw ON uw."workspaceId" = w.id AND uw."deletedAt" IS NULL
       WHERE ${whereClause}
       GROUP BY w.id
       ORDER BY "totalUsers" DESC
       LIMIT 10`,
      params,
    );

    return results.map(
      (row: {
        id: string;
        name: string;
        subdomain: string;
        logoFileId: string | null;
        totalUsers: number;
      }) => ({
        id: row.id,
        logo: this.signWorkspaceLogo({
          logoFileId: row.logoFileId,
          workspaceId: row.id,
        }),
        name: row.name ?? '',
        subdomain: row.subdomain ?? '',
        totalUsers: row.totalUsers,
      }),
    );
  }
}
