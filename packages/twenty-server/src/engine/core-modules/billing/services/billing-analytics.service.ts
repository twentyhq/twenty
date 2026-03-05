/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type UserWorkspaceUsageRow = {
  userWorkspaceId: string;
  eventType: string;
  totalCredits: string;
  eventCount: string;
};

type ResourceUsageRow = {
  resourceId: string;
  resourceType: string;
  totalCredits: string;
};

export type UserWorkspaceUsage = {
  userWorkspaceId: string;
  eventType: string;
  totalCredits: number;
  eventCount: number;
};

export type ResourceUsage = {
  resourceId: string;
  resourceType: string;
  totalCredits: number;
};

@Injectable()
export class BillingAnalyticsService {
  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async getWorkspaceTotalUsage(
    workspaceId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<number> {
    if (!this.twentyConfigService.get('CLICKHOUSE_URL')) {
      return 0;
    }

    const result = await this.clickHouseService.select<{ total: string }>(
      `SELECT SUM(creditsUsed) as total FROM billingEvent
       WHERE workspaceId = {workspaceId:String}
         AND timestamp >= {periodStart:DateTime64}
         AND timestamp < {periodEnd:DateTime64}`,
      {
        workspaceId,
        periodStart: formatDateForClickHouse(periodStart),
        periodEnd: formatDateForClickHouse(periodEnd),
      },
    );

    return Number(result[0]?.total ?? 0);
  }

  async getUserWorkspaceUsageBreakdown(
    workspaceId: string,
    periodStart: Date,
    periodEnd: Date,
    userWorkspaceId?: string,
  ): Promise<UserWorkspaceUsage[]> {
    if (!this.twentyConfigService.get('CLICKHOUSE_URL')) {
      return [];
    }

    const userFilter = userWorkspaceId
      ? 'AND userWorkspaceId = {userWorkspaceId:String}'
      : '';

    const rows = await this.clickHouseService.select<UserWorkspaceUsageRow>(
      `SELECT
          userWorkspaceId,
          eventType,
          SUM(creditsUsed) as totalCredits,
          COUNT(*) as eventCount
        FROM billingEvent
        WHERE workspaceId = {workspaceId:String}
          AND timestamp >= {periodStart:DateTime64}
          AND timestamp < {periodEnd:DateTime64}
          ${userFilter}
        GROUP BY userWorkspaceId, eventType`,
      {
        workspaceId,
        periodStart: formatDateForClickHouse(periodStart),
        periodEnd: formatDateForClickHouse(periodEnd),
        ...(userWorkspaceId ? { userWorkspaceId } : {}),
      },
    );

    return rows.map((row) => ({
      userWorkspaceId: row.userWorkspaceId,
      eventType: row.eventType,
      totalCredits: Number(row.totalCredits),
      eventCount: Number(row.eventCount),
    }));
  }

  async getResourceUsageBreakdown(
    workspaceId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<ResourceUsage[]> {
    if (!this.twentyConfigService.get('CLICKHOUSE_URL')) {
      return [];
    }

    const rows = await this.clickHouseService.select<ResourceUsageRow>(
      `SELECT
        resourceId,
        resourceType,
        SUM(creditsUsed) as totalCredits
      FROM billingEvent
      WHERE workspaceId = {workspaceId:String}
        AND timestamp >= {periodStart:DateTime64}
        AND timestamp < {periodEnd:DateTime64}
        AND resourceId != ''
      GROUP BY resourceId, resourceType`,
      {
        workspaceId,
        periodStart: formatDateForClickHouse(periodStart),
        periodEnd: formatDateForClickHouse(periodEnd),
      },
    );

    return rows.map((row) => ({
      resourceId: row.resourceId,
      resourceType: row.resourceType,
      totalCredits: Number(row.totalCredits),
    }));
  }
}
