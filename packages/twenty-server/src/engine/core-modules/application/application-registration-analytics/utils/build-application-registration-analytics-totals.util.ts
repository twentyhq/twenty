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

  return { ...counts, activeWorkspaces };
};
