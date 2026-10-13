import { APPLICATION_REGISTRATION_ANALYTICS_MIN_WORKSPACE_COUNT } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-analytics-min-workspace-count.constant';
import { type ApplicationRegistrationMetricRowWithWorkspaceCount } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-row-with-workspace-count.type';

export const filterApplicationRegistrationMetricRowsByWorkspaceCount = <
  TRow extends ApplicationRegistrationMetricRowWithWorkspaceCount,
>({
  rows,
  minimumWorkspaceCount = APPLICATION_REGISTRATION_ANALYTICS_MIN_WORKSPACE_COUNT,
}: {
  rows: TRow[];
  minimumWorkspaceCount?: number;
}): TRow[] =>
  rows.filter((row) => Number(row.workspaceCount) >= minimumWorkspaceCount);
