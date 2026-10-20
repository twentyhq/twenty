import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EventLogTable } from 'twenty-shared/types';
import { getApplicationMonitoringLookbackInHours } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { type AdminApplicationLogsInput } from 'src/engine/core-modules/application/application-monitoring/dtos/admin-application-logs.input';
import { buildAdminApplicationLogsFilter } from 'src/engine/core-modules/application/application-monitoring/utils/build-admin-application-logs-filter.util';
import { resolveApplicationMonitoringPeriod } from 'src/engine/core-modules/application/application-monitoring/utils/resolve-application-monitoring-period.util';
import { type EventLogQueryResult } from 'src/engine/core-modules/event-logs/dtos/event-log-result.dto';
import { EventLogRetentionService } from 'src/engine/core-modules/event-logs/retention/services/event-log-retention.service';
import { normalizeEventLogRecords } from 'src/engine/core-modules/event-logs/utils/normalize-event-log-records';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const DEFAULT_PAGE_SIZE = 100;

@Injectable()
export class AdminApplicationLogsService {
  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly eventLogRetentionService: EventLogRetentionService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async getLogs({
    input,
    viewerWorkspaceId,
  }: {
    input: AdminApplicationLogsInput;
    viewerWorkspaceId: string;
  }): Promise<EventLogQueryResult> {
    const lookbackInHours = getApplicationMonitoringLookbackInHours({
      hasAuditLogsEntitlement:
        await this.eventLogRetentionService.hasAuditLogsEntitlement(
          viewerWorkspaceId,
        ),
    });

    const period = resolveApplicationMonitoringPeriod({
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      lookbackInHours,
    });

    const { whereClause, params } = buildAdminApplicationLogsFilter({
      input,
      period,
    });

    const limit = input.first ?? DEFAULT_PAGE_SIZE;
    const offset = Number(input.after ?? 0);

    const [rows, countRows] = await Promise.all([
      this.clickHouseService.selectOrThrow<Record<string, unknown>>(
        `SELECT *
         FROM applicationLog
         WHERE ${whereClause}
         ORDER BY timestamp DESC
         LIMIT {limit:UInt32} OFFSET {offset:UInt32}`,
        { ...params, limit, offset },
      ),
      this.clickHouseService.selectOrThrow<{ totalCount: number | string }>(
        `SELECT count() AS totalCount FROM applicationLog WHERE ${whereClause}`,
        params,
      ),
    ]);

    const totalCount = Number(countRows[0]?.totalCount ?? 0);
    const workspaceNameById = await this.findWorkspaceNames(
      rows.map((row) => String(row.workspaceId)),
    );
    const records = normalizeEventLogRecords(
      rows,
      EventLogTable.APPLICATION_LOG,
    ).map((record, index) => {
      const workspaceId = String(rows[index].workspaceId);

      return {
        ...record,
        properties: {
          ...record.properties,
          workspaceId,
          workspaceName: workspaceNameById.get(workspaceId) ?? null,
        },
      };
    });

    const nextOffset = offset + records.length;
    const hasNextPage = nextOffset < totalCount;

    return {
      records,
      totalCount,
      pageInfo: {
        hasNextPage,
        endCursor: hasNextPage ? String(nextOffset) : undefined,
      },
    };
  }

  private async findWorkspaceNames(
    workspaceIds: string[],
  ): Promise<Map<string, string | null>> {
    const workspaces = await this.workspaceRepository.find({
      where: { id: In([...new Set(workspaceIds)]) },
      select: ['id', 'displayName'],
      withDeleted: true,
    });

    return new Map(
      workspaces.map((workspace) => [
        workspace.id,
        workspace.displayName ?? null,
      ]),
    );
  }
}
