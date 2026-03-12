/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';

export type BillingUsageBreakdownItem = {
  key: string;
  creditsUsed: number;
};

export type BillingUsageTimeSeriesPoint = {
  date: string;
  creditsUsed: number;
};

@Injectable()
export class BillingAnalyticsService {
  private readonly logger = new Logger(BillingAnalyticsService.name);

  constructor(private readonly clickHouseService: ClickHouseService) {}

  async getUsageByUser(
    workspaceId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<BillingUsageBreakdownItem[]> {
    const query = `
      SELECT
        userWorkspaceId AS key,
        sum(creditsUsed) AS creditsUsed
      FROM billingEvent
      WHERE workspaceId = {workspaceId:String}
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
        AND userWorkspaceId != ''
      GROUP BY userWorkspaceId
      ORDER BY creditsUsed DESC
    `;

    return this.clickHouseService.select<BillingUsageBreakdownItem>(query, {
      workspaceId,
      periodStart: formatDateForClickHouse(periodStart),
      periodEnd: formatDateForClickHouse(periodEnd),
    });
  }

  async getUsageByResource(
    workspaceId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<BillingUsageBreakdownItem[]> {
    const query = `
      SELECT
        resourceId AS key,
        sum(creditsUsed) AS creditsUsed
      FROM billingEvent
      WHERE workspaceId = {workspaceId:String}
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
        AND resourceId != ''
      GROUP BY resourceId
      ORDER BY creditsUsed DESC
    `;

    return this.clickHouseService.select<BillingUsageBreakdownItem>(query, {
      workspaceId,
      periodStart: formatDateForClickHouse(periodStart),
      periodEnd: formatDateForClickHouse(periodEnd),
    });
  }

  async getUsageByExecutionType(
    workspaceId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<BillingUsageBreakdownItem[]> {
    const query = `
      SELECT
        executionType AS key,
        sum(creditsUsed) AS creditsUsed
      FROM billingEvent
      WHERE workspaceId = {workspaceId:String}
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
      GROUP BY executionType
      ORDER BY creditsUsed DESC
    `;

    return this.clickHouseService.select<BillingUsageBreakdownItem>(query, {
      workspaceId,
      periodStart: formatDateForClickHouse(periodStart),
      periodEnd: formatDateForClickHouse(periodEnd),
    });
  }

  async getUsageTimeSeries(
    workspaceId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<BillingUsageTimeSeriesPoint[]> {
    const query = `
      SELECT
        formatDateTime(timestamp, '%Y-%m-%d') AS date,
        sum(creditsUsed) AS creditsUsed
      FROM billingEvent
      WHERE workspaceId = {workspaceId:String}
        AND timestamp >= {periodStart:String}
        AND timestamp < {periodEnd:String}
      GROUP BY date
      ORDER BY date ASC
    `;

    return this.clickHouseService.select<BillingUsageTimeSeriesPoint>(query, {
      workspaceId,
      periodStart: formatDateForClickHouse(periodStart),
      periodEnd: formatDateForClickHouse(periodEnd),
    });
  }
}
