/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { EventLogTable } from 'twenty-shared/types';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { formatDateForClickHouse } from 'src/database/clickHouse/clickHouse.util';

const CLICKHOUSE_TABLE_NAMES: Record<EventLogTable, string> = {
  [EventLogTable.WORKSPACE_EVENT]: 'workspaceEvent',
  [EventLogTable.PAGEVIEW]: 'pageview',
  [EventLogTable.OBJECT_EVENT]: 'objectEvent',
};

export type EventLogCleanupParams = {
  workspaceId: string;
  retentionDays: number;
};

@Injectable()
export class EventLogCleanupService {
  private readonly logger = new Logger(EventLogCleanupService.name);

  constructor(private readonly clickHouseService: ClickHouseService) {}

  async cleanupWorkspaceEventLogs({
    workspaceId,
    retentionDays,
  }: EventLogCleanupParams): Promise<void> {
    if (!this.clickHouseService.getMainClient()) {
      this.logger.debug(
        'ClickHouse not configured, skipping event log cleanup',
      );

      return;
    }

    const cutoffDate = new Date();

    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    for (const table of Object.values(EventLogTable)) {
      const tableName = CLICKHOUSE_TABLE_NAMES[table];

      try {
        // ClickHouse ALTER TABLE DELETE is async by default
        // We use lightweight deletes (mutations) which are efficient
        const success = await this.clickHouseService.executeCommand(
          `ALTER TABLE ${tableName} DELETE WHERE "workspaceId" = {workspaceId:String} AND "timestamp" < {cutoffDate:DateTime64(3)}`,
          {
            workspaceId,
            cutoffDate: formatDateForClickHouse(cutoffDate),
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
