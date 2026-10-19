import { parseClickHouseDateTime } from 'src/database/clickhouse/utils/parse-clickhouse-date-time.util';
import { type ApplicationMonitoringWorkspaceDTO } from 'src/engine/core-modules/application/application-monitoring/dtos/admin-application-monitoring.dto';
import { type ApplicationMonitoringWorkspaceRow } from 'src/engine/core-modules/application/application-monitoring/types/application-monitoring-rows.type';

export const mapApplicationMonitoringWorkspaceRows = ({
  rows,
  workspaceNameById,
}: {
  rows: ApplicationMonitoringWorkspaceRow[];
  workspaceNameById: Map<string, string | null>;
}): ApplicationMonitoringWorkspaceDTO[] =>
  rows.map((row) => ({
    workspaceId: row.workspaceId,
    workspaceName: workspaceNameById.get(row.workspaceId) ?? null,
    applicationVersion: row.applicationVersion,
    runCount: Number(row.runCount),
    failedRunCount: Number(row.failedRunCount),
    rateLimitEventCount: Number(row.rateLimitEventCount),
    lastEventAt: parseClickHouseDateTime(row.lastEventAt),
  }));
