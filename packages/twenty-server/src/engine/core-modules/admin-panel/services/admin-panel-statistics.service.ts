import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { type AdminPanelRecentUserDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-recent-user.dto';
import { type AdminPanelTopWorkspaceDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-top-workspace.dto';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class AdminPanelStatisticsService {
  constructor(
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

    const results = await this.userRepository.manager.query(
      `SELECT * FROM (
         SELECT DISTINCT ON (u.id) u.id, u.email, u."firstName", u."lastName", u."createdAt",
                w."displayName" AS "workspaceName", w.id AS "workspaceId"
         FROM core."user" u
         LEFT JOIN core."userWorkspace" uw ON uw."userId" = u.id AND uw."deletedAt" IS NULL
         LEFT JOIN core.workspace w ON w.id = uw."workspaceId" AND w."deletedAt" IS NULL
         WHERE ${whereClause}
         ORDER BY u.id, u."createdAt" DESC
       ) sub
       ORDER BY sub."createdAt" DESC
       LIMIT 10`,
      params,
    );

    return results.map(
      (row: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        createdAt: Date;
        workspaceName: string | null;
        workspaceId: string | null;
      }) => ({
        id: row.id,
        email: row.email,
        firstName: row.firstName || null,
        lastName: row.lastName || null,
        createdAt: row.createdAt,
        workspaceName: row.workspaceName ?? null,
        workspaceId: row.workspaceId ?? null,
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
      `SELECT w.id, w."displayName" AS name, w.subdomain, COUNT(uw.id)::int AS "totalUsers"
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
        totalUsers: number;
      }) => ({
        id: row.id,
        name: row.name ?? '',
        subdomain: row.subdomain ?? '',
        totalUsers: row.totalUsers,
      }),
    );
  }
}
