/* @license Enterprise */

import { BadRequestException, Injectable } from '@nestjs/common';

import { EventLogTable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';

import {
  EventLogsException,
  EventLogsExceptionCode,
} from './event-logs.exception';

import { EventLogFiltersInput } from './dtos/event-log-filters.input';
import { EventLogQueryInput } from './dtos/event-log-query.input';
import {
  EventLogQueryResult,
  EventLogRecord,
} from './dtos/event-log-result.output';

type ClickHouseEventRecord = {
  event?: string;
  name?: string;
  timestamp: string;
  userWorkspaceId?: string;
  properties?: Record<string, unknown>;
  recordId?: string;
  objectMetadataId?: string;
  isCustom?: boolean;
};

const ALLOWED_TABLES = Object.values(EventLogTable);
const MAX_LIMIT = 10000;

const CLICKHOUSE_TABLE_NAMES: Record<EventLogTable, string> = {
  [EventLogTable.WORKSPACE_EVENT]: 'workspaceEvent',
  [EventLogTable.PAGEVIEW]: 'pageview',
  [EventLogTable.OBJECT_EVENT]: 'objectEvent',
};

@Injectable()
export class EventLogsService {
  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly billingService: BillingService,
  ) {}

  async queryEventLogs(
    workspaceId: string,
    input: EventLogQueryInput,
  ): Promise<EventLogQueryResult> {
    await this.validateAccess(workspaceId);

    if (!ALLOWED_TABLES.includes(input.table)) {
      throw new BadRequestException(`Invalid table: ${input.table}`);
    }

    const limit = Math.min(input.first ?? 100, MAX_LIMIT);
    const tableName = CLICKHOUSE_TABLE_NAMES[input.table];
    const eventFieldName =
      input.table === EventLogTable.PAGEVIEW ? 'name' : 'event';

    const whereClauses: string[] = ['"workspaceId" = {workspaceId:String}'];
    const params: Record<string, unknown> = { workspaceId };

    this.applyFilters(
      whereClauses,
      params,
      input.filters,
      eventFieldName,
      input.table,
    );

    const paginationClauses = [...whereClauses];

    if (isDefined(input.after)) {
      const cursorMs = this.decodeCursor(input.after);

      paginationClauses.push(
        '"timestamp" < fromUnixTimestamp64Milli({cursorMs:Int64})',
      );
      params.cursorMs = cursorMs;
    }

    const filterWhereClause = whereClauses.join(' AND ');
    const paginationWhereClause = paginationClauses.join(' AND ');

    const countQuery = `
      SELECT count() as totalCount
      FROM ${tableName}
      WHERE ${filterWhereClause}
    `;

    const query = `
      SELECT *
      FROM ${tableName}
      WHERE ${paginationWhereClause}
      ORDER BY "timestamp" DESC
      LIMIT {limit:Int32}
    `;

    params.limit = limit + 1;

    const [records, countResult] = await Promise.all([
      this.clickHouseService.select<ClickHouseEventRecord>(query, params),
      this.clickHouseService.select<{ totalCount: number }>(countQuery, params),
    ]);

    const totalCount = countResult[0]?.totalCount ?? 0;
    const hasNextPage = records.length > limit;

    if (hasNextPage) {
      records.pop();
    }

    const normalizedRecords = this.normalizeRecords(records, input.table);
    const lastRecord = normalizedRecords[normalizedRecords.length - 1];
    const endCursor =
      hasNextPage && lastRecord
        ? this.encodeCursor(lastRecord.timestamp)
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

  private async validateAccess(workspaceId: string): Promise<void> {
    if (!this.clickHouseService.getMainClient()) {
      throw new EventLogsException(
        'Audit logs require ClickHouse to be configured. Please set the CLICKHOUSE_URL environment variable.',
        EventLogsExceptionCode.CLICKHOUSE_NOT_CONFIGURED,
      );
    }

    const hasEntitlement = await this.billingService.hasEntitlement(
      workspaceId,
      BillingEntitlementKey.AUDIT_LOGS,
    );

    if (!hasEntitlement) {
      throw new EventLogsException(
        'Audit logs require an Enterprise subscription.',
        EventLogsExceptionCode.NO_ENTITLEMENT,
      );
    }
  }

  private applyFilters(
    whereClauses: string[],
    params: Record<string, unknown>,
    filters: EventLogFiltersInput | undefined,
    eventFieldName: string,
    table: EventLogTable,
  ): void {
    if (!isDefined(filters)) {
      return;
    }

    if (isDefined(filters.eventType)) {
      whereClauses.push(
        `lower("${eventFieldName}") LIKE {eventTypePattern:String}`,
      );
      params.eventTypePattern = `%${filters.eventType.toLowerCase()}%`;
    }

    if (isDefined(filters.userWorkspaceId)) {
      whereClauses.push('"userWorkspaceId" = {userWorkspaceId:String}');
      params.userWorkspaceId = filters.userWorkspaceId;
    }

    if (isDefined(filters.dateRange?.start)) {
      whereClauses.push('"timestamp" >= {startDate:DateTime64(3)}');
      params.startDate = formatDateForClickHouse(filters.dateRange.start);
    }

    if (isDefined(filters.dateRange?.end)) {
      whereClauses.push('"timestamp" <= {endDate:DateTime64(3)}');
      params.endDate = formatDateForClickHouse(filters.dateRange.end);
    }

    if (table === EventLogTable.OBJECT_EVENT) {
      if (isDefined(filters.recordId)) {
        whereClauses.push('"recordId" = {recordId:String}');
        params.recordId = filters.recordId;
      }

      if (isDefined(filters.objectMetadataId)) {
        whereClauses.push('"objectMetadataId" = {objectMetadataId:String}');
        params.objectMetadataId = filters.objectMetadataId;
      }
    }
  }

  private encodeCursor(timestamp: Date): string {
    return Buffer.from(String(timestamp.getTime())).toString('base64');
  }

  private decodeCursor(cursor: string): number {
    return parseInt(Buffer.from(cursor, 'base64').toString('utf-8'), 10);
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
        userWorkspaceId: record.userWorkspaceId,
        properties: record.properties,
        recordId: record.recordId,
        objectMetadataId: record.objectMetadataId,
        isCustom: record.isCustom,
      };
    });
  }
}
