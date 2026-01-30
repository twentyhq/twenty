import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import {
  buildClickHouseCountQuery,
  buildClickHouseSelectQuery,
} from 'src/engine/api/clickhouse-query-runners/utils/clickhouse-query-builder.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

import {
  EventLogFiltersInput,
  EventLogOrderByDirection,
  EventLogOrderByField,
  EventLogQueryInput,
  EventLogQueryResult,
  EventLogRecord,
  EventLogTable,
} from './dtos';

type ClickHouseEventRecord = {
  event?: string;
  name?: string;
  timestamp: string;
  userId?: string;
  properties?: Record<string, unknown>;
  recordId?: string;
  objectMetadataId?: string;
  isCustom?: boolean;
};

@Injectable()
export class EventLogsService {
  private readonly logger = new Logger(EventLogsService.name);
  private readonly MAX_LIMIT = 10000;
  private readonly ALLOWED_TABLES: string[] = [
    EventLogTable.WORKSPACE_EVENT,
    EventLogTable.PAGEVIEW,
    EventLogTable.OBJECT_EVENT,
  ];

  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async queryEventLogs(
    workspaceId: string,
    input: EventLogQueryInput,
  ): Promise<EventLogQueryResult> {
    if (!this.ALLOWED_TABLES.includes(input.table)) {
      throw new BadRequestException(`Invalid table: ${input.table}`);
    }

    const limit = Math.min(input.limit ?? 100, this.MAX_LIMIT);
    const offset = input.offset ?? 0;

    // Resolve workspaceMemberId to userId if provided
    const resolvedFilters = await this.resolveWorkspaceMemberFilter(
      workspaceId,
      input.filters,
    );

    const filter = this.buildFilter(resolvedFilters, input.table);
    const orderBy = this.buildOrderBy(input.orderBy);

    const { query, params } = buildClickHouseSelectQuery({
      tableName: input.table,
      filter,
      orderBy,
      limit: limit + 1,
      offset,
      workspaceId,
    });

    this.logger.debug(`Executing ClickHouse query: ${query}`);
    this.logger.debug(`With params: ${JSON.stringify(params)}`);

    const records =
      await this.clickHouseService.select<ClickHouseEventRecord>(query, params);

    const { query: countQuery, params: countParams } = buildClickHouseCountQuery(
      {
        tableName: input.table,
        filter,
        workspaceId,
      },
    );

    const countResult = await this.clickHouseService.select<{
      totalCount: number;
    }>(countQuery, countParams);

    const totalCount = countResult[0]?.totalCount ?? 0;

    const hasNextPage = records.length > limit;

    if (hasNextPage) {
      records.pop();
    }

    const normalizedRecords = this.normalizeRecords(records, input.table);

    return {
      records: normalizedRecords,
      totalCount,
      hasNextPage,
    };
  }

  private buildFilter(
    filters: EventLogFiltersInput | undefined,
    table: EventLogTable,
  ): Record<string, unknown> | undefined {
    if (!isDefined(filters)) {
      return undefined;
    }

    const filterObj: Record<string, unknown> = {};

    if (isDefined(filters.eventType)) {
      const eventFieldName =
        table === EventLogTable.PAGEVIEW ? 'name' : 'event';

      // Use case-insensitive contains for better search experience
      filterObj[eventFieldName] = { ilike: `%${filters.eventType}%` };
    }

    if (isDefined(filters.userId)) {
      filterObj.userId = { eq: filters.userId };
    }

    if (isDefined(filters.dateRange)) {
      const timestampFilter: Record<string, unknown> = {};

      // Format date to 'yyyy-MM-dd HH:mm:ss' in UTC for ClickHouse DateTime64 comparison
      // Data in ClickHouse is stored in UTC
      const formatForClickHouse = (date: Date) => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      if (isDefined(filters.dateRange.start)) {
        const startDate =
          filters.dateRange.start instanceof Date
            ? filters.dateRange.start
            : new Date(filters.dateRange.start);

        timestampFilter.gte = formatForClickHouse(startDate);
      }
      if (isDefined(filters.dateRange.end)) {
        const endDate =
          filters.dateRange.end instanceof Date
            ? filters.dateRange.end
            : new Date(filters.dateRange.end);

        timestampFilter.lte = formatForClickHouse(endDate);
      }
      if (Object.keys(timestampFilter).length > 0) {
        filterObj.timestamp = timestampFilter;
      }
    }

    if (table === EventLogTable.OBJECT_EVENT) {
      if (isDefined(filters.recordId)) {
        filterObj.recordId = { eq: filters.recordId };
      }
      if (isDefined(filters.objectMetadataId)) {
        filterObj.objectMetadataId = { eq: filters.objectMetadataId };
      }
    }

    return Object.keys(filterObj).length > 0 ? filterObj : undefined;
  }

  private buildOrderBy(
    orderBy:
      | { field: EventLogOrderByField; direction: EventLogOrderByDirection }
      | undefined,
  ): Array<Record<string, string>> {
    if (!isDefined(orderBy)) {
      return [{ timestamp: 'DESC' }];
    }

    return [{ [orderBy.field]: orderBy.direction }];
  }

  private normalizeRecords(
    records: ClickHouseEventRecord[],
    table: EventLogTable,
  ): EventLogRecord[] {
    return records.map((record) => {
      const eventName =
        table === EventLogTable.PAGEVIEW
          ? record.name ?? ''
          : record.event ?? '';

      return {
        event: eventName,
        timestamp: new Date(record.timestamp),
        userId: record.userId,
        properties: record.properties,
        recordId: record.recordId,
        objectMetadataId: record.objectMetadataId,
        isCustom: record.isCustom,
      };
    });
  }

  getAvailableTables(): EventLogTable[] {
    return Object.values(EventLogTable);
  }

  private async resolveWorkspaceMemberFilter(
    workspaceId: string,
    filters: EventLogFiltersInput | undefined,
  ): Promise<EventLogFiltersInput | undefined> {
    if (!isDefined(filters) || !isDefined(filters.workspaceMemberId)) {
      return filters;
    }

    this.logger.debug(
      `Resolving workspaceMemberId ${filters.workspaceMemberId} to userId`,
    );

    // Look up the userId from workspace member
    const authContext = buildSystemAuthContext(workspaceId);

    const userId = await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        const workspaceMember = await workspaceMemberRepository.findOne({
          where: {
            id: filters.workspaceMemberId,
          },
        });

        this.logger.debug(
          `Found workspace member: ${JSON.stringify(workspaceMember)}`,
        );

        return workspaceMember?.userId;
      },
    );

    if (!isDefined(userId)) {
      this.logger.warn(
        `Workspace member ${filters.workspaceMemberId} not found in workspace ${workspaceId}`,
      );
    } else {
      this.logger.debug(`Resolved userId: ${userId}`);
    }

    // Return filters with resolved userId (keeping workspaceMemberId for reference)
    return {
      ...filters,
      userId: userId ?? filters.userId,
    };
  }
}
