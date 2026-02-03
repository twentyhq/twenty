import { BadRequestException, Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import {
  buildClickHouseCountQuery,
  buildClickHouseSelectQuery,
} from 'src/engine/core-modules/event-logs/utils/clickhouse-query-builder.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

import { EventLogFiltersInput } from './dtos/event-log-filters.input';
import {
  EventLogOrderByDirection,
  EventLogOrderByField,
} from './dtos/event-log-order-by.input';
import { EventLogQueryInput } from './dtos/event-log-query.input';
import {
  EventLogQueryResult,
  EventLogRecord,
} from './dtos/event-log-result.output';
import { EventLogTable } from './dtos/event-log-table.enum';

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

const ALLOWED_TABLES = Object.values(EventLogTable);
const MAX_LIMIT = 10000;

@Injectable()
export class EventLogsService {
  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async queryEventLogs(
    workspaceId: string,
    input: EventLogQueryInput,
  ): Promise<EventLogQueryResult> {
    if (!ALLOWED_TABLES.includes(input.table)) {
      throw new BadRequestException(`Invalid table: ${input.table}`);
    }

    const limit = Math.min(input.first ?? 100, MAX_LIMIT);

    const resolvedFilters = await this.resolveWorkspaceMemberFilter(
      workspaceId,
      input.filters,
    );

    const cursorFilter = this.buildCursorFilter(input.after);
    const filter = this.buildFilter(resolvedFilters, input.table, cursorFilter);
    const orderBy = this.buildOrderBy(input.orderBy);

    const { query, params } = buildClickHouseSelectQuery({
      tableName: input.table,
      filter,
      orderBy,
      limit: limit + 1,
      workspaceId,
    });

    const records = await this.clickHouseService.select<ClickHouseEventRecord>(
      query,
      params,
    );

    const { query: countQuery, params: countParams } =
      buildClickHouseCountQuery({
        tableName: input.table,
        filter: this.buildFilter(resolvedFilters, input.table),
        workspaceId,
      });

    const countResult = await this.clickHouseService.select<{
      totalCount: number;
    }>(countQuery, countParams);

    const totalCount = countResult[0]?.totalCount ?? 0;
    const hasNextPage = records.length > limit;

    if (hasNextPage) {
      records.pop();
    }

    const normalizedRecords = this.normalizeRecords(records, input.table);
    const endCursor =
      normalizedRecords.length > 0
        ? this.encodeCursor(
            normalizedRecords[normalizedRecords.length - 1].timestamp,
          )
        : undefined;

    return {
      records: normalizedRecords,
      totalCount,
      pageInfo: {
        endCursor,
        hasNextPage,
      },
    };
  }

  private encodeCursor(timestamp: Date): string {
    return Buffer.from(timestamp.toISOString()).toString('base64');
  }

  private decodeCursor(cursor: string): Date {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');

    return new Date(decoded);
  }

  private buildCursorFilter(
    cursor: string | undefined,
  ): Record<string, unknown> | undefined {
    if (!isDefined(cursor)) {
      return undefined;
    }

    const cursorDate = this.decodeCursor(cursor);

    return {
      timestamp: { lt: cursorDate.toISOString() },
    };
  }

  private buildFilter(
    filters: EventLogFiltersInput | undefined,
    table: EventLogTable,
    cursorFilter?: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    const filterObj: Record<string, unknown> = {};

    if (isDefined(cursorFilter)) {
      Object.assign(filterObj, cursorFilter);
    }

    if (!isDefined(filters)) {
      return Object.keys(filterObj).length > 0 ? filterObj : undefined;
    }

    if (isDefined(filters.eventType)) {
      const eventFieldName =
        table === EventLogTable.PAGEVIEW ? 'name' : 'event';

      filterObj[eventFieldName] = { ilike: `%${filters.eventType}%` };
    }

    if (isDefined(filters.userId)) {
      filterObj.userId = { eq: filters.userId };
    }

    if (isDefined(filters.dateRange)) {
      const timestampFilter: Record<string, unknown> = {};

      if (isDefined(filters.dateRange.start)) {
        const startDate =
          filters.dateRange.start instanceof Date
            ? filters.dateRange.start
            : new Date(filters.dateRange.start);

        timestampFilter.gte = startDate.toISOString();
      }
      if (isDefined(filters.dateRange.end)) {
        const endDate =
          filters.dateRange.end instanceof Date
            ? filters.dateRange.end
            : new Date(filters.dateRange.end);

        timestampFilter.lte = endDate.toISOString();
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
          ? (record.name ?? '')
          : (record.event ?? '');

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

  private async resolveWorkspaceMemberFilter(
    workspaceId: string,
    filters: EventLogFiltersInput | undefined,
  ): Promise<EventLogFiltersInput | undefined> {
    if (!isDefined(filters) || !isDefined(filters.workspaceMemberId)) {
      return filters;
    }

    const workspaceMemberRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );

    const workspaceMember = await workspaceMemberRepository.findOne({
      where: {
        id: filters.workspaceMemberId,
      },
    });

    const userId = workspaceMember?.userId;

    return {
      ...filters,
      userId: userId ?? filters.userId,
    };
  }
}
