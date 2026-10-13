import { APPLICATION_REGISTRATION_ANALYTICS_MIN_WORKSPACE_COUNT } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-analytics-min-workspace-count.constant';

export type ApplicationRegistrationMetricRowWithWorkspaceCount = {
  workspaceCount: string | number;
};

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
