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

    const retentionInDaysByTable =
      await this.eventLogRetentionService.getRetentionInDaysByTable({
        workspaceId,
        workspaceRetentionInDays,
      });

    const tablesToClean = Object.values(EventLogTable).filter(
      (table) => table !== EventLogTable.USAGE_EVENT,
    );

    for (const table of tablesToClean) {
      const tableName = getClickHouseTableName(table);
      const retentionDays = retentionInDaysByTable[table];
      const cutoffDate = new Date();

      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

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
            `Scheduled deletion of old ${tableName} events for workspace ${workspaceId} (retention: ${retentionDays} days)`,
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
