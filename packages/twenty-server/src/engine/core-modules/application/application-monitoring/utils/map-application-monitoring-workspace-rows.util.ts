import { parseClickHouseDateTime } from 'src/database/clickhouse/utils/parse-clickhouse-date-time.util';
import { type ApplicationMonitoringWorkspaceDTO } from 'src/engine/core-modules/application/application-monitoring/dtos/admin-application-monitoring.dto';
import { type ApplicationMonitoringWorkspaceRow } from 'src/engine/core-modules/application/application-monitoring/types/application-monitoring-rows.type';

export const mapApplicationMonitoringWorkspaceRows = ({
  rows,
  workspaces,
}: {
  rows: ApplicationMonitoringWorkspaceRow[];
  workspaces: Pick<
    ApplicationMonitoringWorkspaceDTO,
    'workspaceId' | 'workspaceName' | 'workspaceLogoUrl'
  >[];
}): ApplicationMonitoringWorkspaceDTO[] => {
  const workspaceById = new Map(
    workspaces.map((workspace) => [workspace.workspaceId, workspace]),
  );

  return rows.map((row) => ({
    workspaceId: row.workspaceId,
    workspaceName: workspaceById.get(row.workspaceId)?.workspaceName ?? null,
    workspaceLogoUrl:
      workspaceById.get(row.workspaceId)?.workspaceLogoUrl ?? null,
    applicationVersion: row.applicationVersion,
    runCount: Number(row.runCount),
    failedRunCount: Number(row.failedRunCount),
    rateLimitEventCount: Number(row.rateLimitEventCount),
    lastEventAt: parseClickHouseDateTime(row.lastEventAt),
  }));
};
