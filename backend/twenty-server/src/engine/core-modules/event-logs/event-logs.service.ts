/* @license Enterprise */

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EventLogTable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

import {
  EventLogsException,
  EventLogsExceptionCode,
} from './event-logs.exception';

import { EventLogFiltersInput } from './dtos/event-log-filters.input';
import { EventLogQueryInput } from './dtos/event-log-query.input';
import {
  EventLogQueryResult,
  EventLogRecord,
} from './dtos/event-log-result.dto';

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

type ClickHouseUsageEventRecord = {
  timestamp: string;
  userWorkspaceId?: string;
  resourceType?: string;
  operationType?: string;
  quantity?: number;
  unit?: string;
  creditsUsedMicro?: number;
  resourceId?: string;
  resourceContext?: string;
  metadata?: Record<string, unknown>;
};

const ALLOWED_TABLES = Object.values(EventLogTable);
const MAX_LIMIT = 10000;

const CLICKHOUSE_TABLE_NAMES: Record<EventLogTable, string> = {
  [EventLogTable.WORKSPACE_EVENT]: 'workspaceEvent',
  [EventLogTable.PAGEVIEW]: 'pageview',
  [EventLogTable.OBJECT_EVENT]: 'objectEvent',
  [EventLogTable.USAGE_EVENT]: 'usageEvent',
};

@Injectable()
export class EventLogsService {
  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly billingService: BillingService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
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
      input.table === EventLogTable.USAGE_EVENT
        ? 'resourceType'
        : input.table === EventLogTable.PAGEVIEW
          ? 'name'
          : 'event';

    const whereClauses: string[] = ['"workspaceId" = {workspaceId:String}'];
    const params: Record<string, unknown> = { workspaceId };

    await this.applyFilters(
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

  private async applyFilters(
    whereClauses: string[],
    params: Record<string, unknown>,
    filters: EventLogFiltersInput | undefined,
    eventFieldName: string,
    table: EventLogTable,
  ): Promise<void> {
    if (!isDefined(filters)) {
      return;
    }

    if (isDefined(filters.eventType)) {
      whereClauses.push(
        `lower("${eventFieldName}") LIKE {eventTypePattern:String}`,
      );
      params.eventTypePattern = `%${filters.eventType.toLowerCase()}%`;
    }

    // TODO: Legacy event tables (workspaceEvent, pageview, objectEvent) use
    // userId because some actions are logged out. Usage events use
    // userWorkspaceId directly which is more relevant in a workspace context.
    // Consider migrating all event tables to userWorkspaceId for consistency.
    if (isDefined(filters.userWorkspaceId)) {
      if (table === EventLogTable.USAGE_EVENT) {
        whereClauses.push('"userWorkspaceId" = {userWorkspaceId:String}');
        params.userWorkspaceId = filters.userWorkspaceId;
      } else {
        const userWorkspace = await this.userWorkspaceRepository.findOne({
          where: { id: filters.userWorkspaceId },
          select: ['userId'],
        });

        if (isDefined(userWorkspace)) {
          whereClauses.push('"userId" = {userId:String}');
          params.userId = userWorkspace.userId;
        }
      }
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
    records: ClickHouseEventRecord[] | ClickHouseUsageEventRecord[],
    table: EventLogTable,
  ): EventLogRecord[] {
    if (table === EventLogTable.USAGE_EVENT) {
      return (records as ClickHouseUsageEventRecord[]).map((record) => ({
        event: record.resourceType ?? '',
        timestamp: new Date(record.timestamp),
        userId: record.userWorkspaceId,
        properties: {
          operationType: record.operationType,
          quantity: record.quantity,
          unit: record.unit,
          creditsUsedMicro: record.creditsUsedMicro,
          resourceId: record.resourceId,
          resourceContext: record.resourceContext,
          ...(record.metadata ?? {}),
        },
      }));
    }

    return (records as ClickHouseEventRecord[]).map((record) => {
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
}
