/* @license Enterprise */

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EventLogTable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

import {
  EventLogsException,
  EventLogsExceptionCode,
} from './event-logs.exception';

import { EventLogFiltersInput } from './dtos/event-log-filters.input';
import { EventLogQueryInput } from './dtos/event-log-query.input';
import { EventLogQueryResult } from './dtos/event-log-result.dto';
import {
  EVENT_LOG_TYPES,
  getClickHouseTableName,
} from './registry/event-log-registry';
import { normalizeEventLogRecords } from './utils/normalize-event-log-records';

const ALLOWED_TABLES = Object.values(EventLogTable);
const MAX_LIMIT = 10000;

@Injectable()
export class EventLogsService {
  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly billingService: BillingService,
    private readonly enterprisePlanService: EnterprisePlanService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  async queryEventLogs(
    workspaceId: string,
    input: EventLogQueryInput,
  ): Promise<EventLogQueryResult> {
    await this.validateAccess(workspaceId, input.table);

    if (!ALLOWED_TABLES.includes(input.table)) {
      throw new BadRequestException(`Invalid table: ${input.table}`);
    }

    const limit = Math.min(input.first ?? 100, MAX_LIMIT);
    const tableName = getClickHouseTableName(input.table);
    const eventFieldName = EVENT_LOG_TYPES[input.table].eventFieldName;

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
      this.clickHouseService.select<Record<string, unknown>>(query, params),
      this.clickHouseService.select<{ totalCount: number }>(countQuery, params),
    ]);

    const totalCount = countResult[0]?.totalCount ?? 0;
    const hasNextPage = records.length > limit;

    if (hasNextPage) {
      records.pop();
    }

    const normalizedRecords = normalizeEventLogRecords(records, input.table);
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

  async validateAccess(
    workspaceId: string,
    table: EventLogTable,
  ): Promise<void> {
    if (!this.clickHouseService.getMainClient()) {
      throw new EventLogsException(
        'Audit logs require ClickHouse to be configured. Please set the CLICKHOUSE_URL environment variable.',
        EventLogsExceptionCode.CLICKHOUSE_NOT_CONFIGURED,
      );
    }

    const requiredEntitlement = EVENT_LOG_TYPES[table].requiresEntitlement;

    if (requiredEntitlement === null) {
      return;
    }

    const hasAccess =
      this.enterprisePlanService.isValid() &&
      (await this.billingService.hasEntitlement(
        workspaceId,
        requiredEntitlement,
      ));

    if (!hasAccess) {
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

    // TODO: non-usage tables filter by userId (some actions are logged out) while usageEvent uses userWorkspaceId; migrate all to userWorkspaceId for consistency.
    if (isDefined(filters.userWorkspaceId)) {
      if (table === EventLogTable.APPLICATION_LOG) {
        // Application logs don't have a user column
      } else if (table === EventLogTable.USAGE_EVENT) {
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
      params.startDate = formatDateTimeForClickHouse(filters.dateRange.start);
    }

    if (isDefined(filters.dateRange?.end)) {
      whereClauses.push('"timestamp" <= {endDate:DateTime64(3)}');
      params.endDate = formatDateTimeForClickHouse(filters.dateRange.end);
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
}
