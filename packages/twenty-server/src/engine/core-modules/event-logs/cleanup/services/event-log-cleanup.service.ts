/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { EventLogTable } from 'twenty-shared/types';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { getClickHouseTableName } from 'src/engine/core-modules/event-logs/registry/event-log-registry';
import { EventLogRetentionService } from 'src/engine/core-modules/event-logs/retention/services/event-log-retention.service';

export type EventLogCleanupParams = {
  workspaceId: string;
  workspaceRetentionInDays: number;
};

@Injectable()
export class EventLogCleanupService {
  private readonly logger = new Logger(EventLogCleanupService.name);

  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly eventLogRetentionService: EventLogRetentionService,
  ) {}

  async cleanupWorkspaceEventLogs({
    workspaceId,
    workspaceRetentionInDays,
  }: EventLogCleanupParams): Promise<void> {
    if (!this.clickHouseService.getMainClient()) {
      this.logger.debug(
        'ClickHouse not configured, skipping event log cleanup',
      );

      return;
    }

    const cutoffDate =
      await this.eventLogRetentionService.getRetentionStartDate({
        workspaceId,
        workspaceRetentionInDays,
      });

    const tablesToClean = Object.values(EventLogTable).filter(
      (table) => table !== EventLogTable.USAGE_EVENT,
    );

    for (const table of tablesToClean) {
      const tableName = getClickHouseTableName(table);

      try {
        const success = await this.clickHouseService.executeCommand(
          `ALTER TABLE ${tableName} DELETE WHERE "workspaceId" = {workspaceId:String} AND "timestamp" < {cutoffDate:DateTime64(3)}`,
          {
            workspaceId,
            cutoffDate: formatDateTimeForClickHouse(cutoffDate),
          },
        );

        if (success) {
          this.logger.log(
            `Scheduled deletion of ${tableName} events before ${cutoffDate.toISOString()} for workspace ${workspaceId}`,
          );
        } else {
          this.logger.warn(
            `Failed to schedule deletion for ${tableName} in workspace ${workspaceId}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error cleaning up ${tableName} for workspace ${workspaceId}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }
}
