/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventLogTable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { ApplicationLogScopeService } from './application-monitoring/application-log-scope.service';
import { EventLogFiltersInput } from './dtos/event-log-filters.input';
import { EventLogQueryInput } from './dtos/event-log-query.input';
import { EventLogQueryResult } from './dtos/event-log-result.dto';
import {
  EventLogsException,
  EventLogsExceptionCode,
} from './event-logs.exception';
import {
  EVENT_LOG_TYPES,
  getClickHouseTableName,
} from './registry/event-log-registry';
import { buildApplicationLogActivityBuckets } from './utils/build-application-log-activity-buckets.util';
import { buildEventLogFieldFilterCondition } from './utils/build-event-log-field-filter-condition.util';
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
    private readonly applicationLogScopeService: ApplicationLogScopeService,
  ) {}

  async queryEventLogs(
    workspace: Pick<WorkspaceEntity, 'id' | 'eventLogRetentionDays'>,
    input: EventLogQueryInput,
    {
      callingApplicationId,
      user,
    }: { callingApplicationId?: string; user?: UserEntity } = {},
  ): Promise<EventLogQueryResult> {
    const workspaceId = workspace.id;

    await this.validateAccess(workspaceId, input.table);

    const limit = Math.min(input.first ?? 100, MAX_LIMIT);
    const tableName = getClickHouseTableName(input.table);
    const eventFieldName = EVENT_LOG_TYPES[input.table].eventFieldName;

    const scope = await this.applicationLogScopeService.resolve({
      workspace,
      input,
      user,
      callingApplicationId,
    });
    const whereClauses: string[] = [
      '"workspaceId" IN {scopeWorkspaceIds:Array(String)}',
      '"timestamp" >= {earliestRetention:DateTime64(3)}',
      'arrayExists((workspace, retention) -> "workspaceId" = workspace AND "timestamp" >= parseDateTime64BestEffort(retention, 3), {scopeWorkspaceIds:Array(String)}, {scopeRetentions:Array(String)})',
    ];
    const params: Record<string, unknown> = {
      earliestRetention: formatDateTimeForClickHouse(
        new Date(
          Math.min(
            ...scope.workspaces.map(({ retentionStartDate }) =>
              retentionStartDate.getTime(),
            ),
            Date.now(),
          ),
        ),
      ),
      scopeWorkspaceIds: scope.workspaces.map(({ id }) => id),
      scopeRetentions: scope.workspaces.map(({ retentionStartDate }) =>
        formatDateTimeForClickHouse(retentionStartDate),
      ),
    };

    if (
      input.table === EventLogTable.APPLICATION_LOG &&
      isDefined(callingApplicationId)
    ) {
      whereClauses.push('"applicationId" = {callingApplicationId:String}');
      params.callingApplicationId = callingApplicationId;
    }

    await this.applyFilters(
      whereClauses,
      params,
      scope.filters,
      eventFieldName,
      input.table,
      false,
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

    const recordsAtLastTimestampQuery = `
      SELECT *
      FROM ${tableName}
      WHERE ${filterWhereClause} AND "timestamp" = {lastRecordTimestamp:DateTime64(3)}
      LIMIT {maxLimit:Int32}
    `;

    params.limit = limit + 1;

    const [records, countResult, activity] = await Promise.all([
      this.clickHouseService.select<Record<string, unknown>>(query, params),
      this.clickHouseService.select<{ totalCount: number }>(countQuery, params),
      input.includeActivity && input.table === EventLogTable.APPLICATION_LOG
        ? this.queryApplicationLogActivity(
            filterWhereClause,
            params,
            input,
            scope.workspaces.map(
              ({ retentionStartDate }) => retentionStartDate,
            ),
          )
        : undefined,
    ]);

    const totalCount = countResult[0]?.totalCount ?? 0;
    const hasNextPage = records.length > limit;
    const lastRecordTimestamp = records[limit - 1]?.timestamp;
    const hasMoreRecordsAtLastTimestamp =
      hasNextPage && records[limit].timestamp === lastRecordTimestamp;

    let pageRecords = records.slice(0, limit);

    if (hasMoreRecordsAtLastTimestamp) {
      params.lastRecordTimestamp = lastRecordTimestamp;
      params.maxLimit = MAX_LIMIT;

      const recordsAtLastTimestamp = await this.clickHouseService.select<
        Record<string, unknown>
      >(recordsAtLastTimestampQuery, params);
      const pageRecordsAtLastTimestamp = pageRecords.filter(
        (record) => record.timestamp === lastRecordTimestamp,
      );

      if (recordsAtLastTimestamp.length >= pageRecordsAtLastTimestamp.length) {
        pageRecords = [
          ...pageRecords.filter(
            (record) => record.timestamp !== lastRecordTimestamp,
          ),
          ...recordsAtLastTimestamp,
        ];
      }
    }

    const normalizedRecords = normalizeEventLogRecords(
      pageRecords,
      input.table,
    );
    if (input.instanceLevel) {
      const names = new Map(
        scope.workspaces.map(({ id, displayName }) => [id, displayName]),
      );
      normalizedRecords.forEach((record) => {
        if (
          record.properties &&
          typeof record.properties.workspaceId === 'string'
        )
          record.properties.workspaceName = names.get(
            record.properties.workspaceId,
          );
      });
    }
    const lastRecord = normalizedRecords[normalizedRecords.length - 1];
    const endCursor =
      hasNextPage && lastRecord
        ? this.encodeCursor(lastRecord.timestamp)
        : undefined;

    return {
      canQueryInstanceLevel: scope.canQueryInstanceLevel,
      activity,
      records: normalizedRecords,
      totalCount,
      pageInfo: {
        endCursor,
        hasNextPage,
      },
    };
  }

  private async queryApplicationLogActivity(
    where: string,
    params: Record<string, unknown>,
    input: EventLogQueryInput,
    retentionStarts: Date[],
  ) {
    const end = input.filters?.dateRange?.end ?? new Date();
    const start =
      input.filters?.dateRange?.start ??
      new Date(
        Math.min(
          ...retentionStarts.map((date) => date.getTime()),
          end.getTime(),
        ),
      );
    const duration = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / 48),
    );
    const rows = await this.clickHouseService.select<{
      bucket: number;
      info: number;
      warning: number;
      error: number;
    }>(
      `
      SELECT intDiv(toUnixTimestamp64Milli("timestamp") - {activityStart:Int64}, {bucketDuration:Int64}) AS bucket,
        countIf(upper("level") NOT IN ('WARN', 'WARNING', 'ERROR', 'FATAL')) AS info,
        countIf(upper("level") IN ('WARN', 'WARNING')) AS warning,
        countIf(upper("level") IN ('ERROR', 'FATAL')) AS error
      FROM applicationLog
      WHERE ${where} AND "timestamp" >= fromUnixTimestamp64Milli({activityStart:Int64})
        AND "timestamp" < fromUnixTimestamp64Milli({activityEnd:Int64})
      GROUP BY bucket ORDER BY bucket`,
      {
        ...params,
        activityStart: start.getTime(),
        activityEnd: end.getTime(),
        bucketDuration: duration,
      },
    );
    return buildApplicationLogActivityBuckets({ start, end, duration, rows });
  }

  async validateAccess(
    workspaceId: string,
    table: EventLogTable,
  ): Promise<void> {
    if (!ALLOWED_TABLES.includes(table)) {
      throw new EventLogsException(
        `Invalid table: ${table}`,
        EventLogsExceptionCode.INVALID_TABLE,
      );
    }

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
        'Audit logs require an Organization subscription.',
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
    validateValuesCount = true,
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

    filters.fieldFilters?.forEach((fieldFilter, index) => {
      const parameterName = `fieldFilter${index}`;

      whereClauses.push(
        buildEventLogFieldFilterCondition({
          fieldFilter,
          parameterName,
          table,
          validateValuesCount,
        }),
      );
      params[parameterName] = fieldFilter.values;
    });
  }

  private encodeCursor(timestamp: Date): string {
    return Buffer.from(String(timestamp.getTime())).toString('base64');
  }

  private decodeCursor(cursor: string): number {
    return parseInt(Buffer.from(cursor, 'base64').toString('utf-8'), 10);
  }
}
