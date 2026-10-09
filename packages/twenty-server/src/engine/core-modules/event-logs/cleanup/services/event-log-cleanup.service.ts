/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { EventLogTable } from 'twenty-shared/types';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { EVENT_LOG_CLEANUP_WORKSPACE_BATCH_SIZE } from 'src/engine/core-modules/event-logs/cleanup/constants/event-log-cleanup-workspace-batch-size.constant';
import { getClickHouseTableName } from 'src/engine/core-modules/event-logs/registry/event-log-registry';
import { EventLogRetentionService } from 'src/engine/core-modules/event-logs/retention/services/event-log-retention.service';

export type EventLogCleanupWorkspace = {
  id: string;
  eventLogRetentionDays: number;
};

@Injectable()
export class EventLogCleanupService {
  private readonly logger = new Logger(EventLogCleanupService.name);

  constructor(
    private readonly clickHouseService: ClickHouseService,
    private readonly eventLogRetentionService: EventLogRetentionService,
  ) {}

  async cleanupEventLogs(
    workspaces: EventLogCleanupWorkspace[],
  ): Promise<void> {
    if (!this.clickHouseService.getMainClient()) {
      this.logger.debug(
        'ClickHouse not configured, skipping event log cleanup',
      );

      return;
    }

    const workspaceIdsByRetentionInHours =
      await this.groupWorkspaceIdsByRetentionInHours(workspaces);

    const tablesToClean = Object.values(EventLogTable).filter(
      (table) => table !== EventLogTable.USAGE_EVENT,
    );

    const now = Date.now();

    for (const [
      retentionInHours,
      workspaceIds,
    ] of workspaceIdsByRetentionInHours) {
      const cutoffDate = new Date(now - retentionInHours * 60 * 60 * 1000);

      for (const workspaceIdsBatch of chunk(
        workspaceIds,
        EVENT_LOG_CLEANUP_WORKSPACE_BATCH_SIZE,
      )) {
        for (const table of tablesToClean) {
          await this.deleteEventLogsBefore({
            table,
            workspaceIds: workspaceIdsBatch,
            cutoffDate,
          });
        }
      }
    }
  }

  private async groupWorkspaceIdsByRetentionInHours(
    workspaces: EventLogCleanupWorkspace[],
  ): Promise<Map<number, string[]>> {
    const workspaceIdsByRetentionInHours = new Map<number, string[]>();

    for (const workspace of workspaces) {
      const retentionInHours =
        await this.eventLogRetentionService.getRetentionInHours({
          workspaceId: workspace.id,
          workspaceRetentionInDays: workspace.eventLogRetentionDays,
        });

      const workspaceIds =
        workspaceIdsByRetentionInHours.get(retentionInHours) ?? [];

      workspaceIds.push(workspace.id);
      workspaceIdsByRetentionInHours.set(retentionInHours, workspaceIds);
    }

    return workspaceIdsByRetentionInHours;
  }

  private async deleteEventLogsBefore({
    table,
    workspaceIds,
    cutoffDate,
  }: {
    table: EventLogTable;
    workspaceIds: string[];
    cutoffDate: Date;
  }): Promise<void> {
    const tableName = getClickHouseTableName(table);

    try {
      const success = await this.clickHouseService.executeCommand(
        `ALTER TABLE ${tableName} DELETE WHERE "workspaceId" IN ({workspaceIds:Array(String)}) AND "timestamp" < {cutoffDate:DateTime64(3)}`,
        {
          workspaceIds,
          cutoffDate: formatDateTimeForClickHouse(cutoffDate),
        },
      );

      if (success) {
        this.logger.log(
          `Scheduled deletion of ${tableName} events before ${cutoffDate.toISOString()} for ${workspaceIds.length} workspace(s)`,
        );
      } else {
        this.logger.warn(
          `Failed to schedule deletion for ${tableName} in ${workspaceIds.length} workspace(s)`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error cleaning up ${tableName} for ${workspaceIds.length} workspace(s)`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
