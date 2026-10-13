import { APPLICATION_REGISTRATION_ANALYTICS_MIN_WORKSPACE_COUNT } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-analytics-min-workspace-count.constant';
import { type ApplicationRegistrationAnalyticsTotalsDTO } from 'src/engine/core-modules/application/application-registration-analytics/dtos/application-registration-analytics.dto';
import {
  addMetricRowToApplicationRegistrationAnalyticsCounts,
  type ApplicationRegistrationMetricSumRow,
} from 'src/engine/core-modules/application/application-registration-analytics/utils/add-metric-row-to-application-registration-analytics-counts.util';
import { createEmptyApplicationRegistrationAnalyticsCounts } from 'src/engine/core-modules/application/application-registration-analytics/utils/create-empty-application-registration-analytics-counts.util';

export const buildApplicationRegistrationAnalyticsTotals = ({
  rows,
  activeWorkspaces,
}: {
  rows: ApplicationRegistrationMetricSumRow[];
  activeWorkspaces: number;
}): ApplicationRegistrationAnalyticsTotalsDTO => {
  const counts = rows.reduce(
    addMetricRowToApplicationRegistrationAnalyticsCounts,
    createEmptyApplicationRegistrationAnalyticsCounts(),
  );

  return {
    ...counts,
    activeWorkspaces:
      activeWorkspaces >= APPLICATION_REGISTRATION_ANALYTICS_MIN_WORKSPACE_COUNT
        ? activeWorkspaces
        : 0,
  };
};
