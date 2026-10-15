import semver from 'semver';

import { APPLICATION_REGISTRATION_ANALYTICS_VERSION_LIMIT } from 'src/engine/core-modules/application/application-registration-analytics/constants/application-registration-analytics-version-limit.constant';
import { type ApplicationRegistrationAnalyticsVersionDTO } from 'src/engine/core-modules/application/application-registration-analytics/dtos/application-registration-analytics.dto';
import { type ApplicationRegistrationDailyVersionActiveWorkspacesRow } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-daily-version-active-workspaces-row.type';
import { type ApplicationRegistrationMetricCellRow } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-cell-row.type';
import { type ApplicationRegistrationVersionActiveWorkspacesRow } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-version-active-workspaces-row.type';
import { buildApplicationRegistrationAnalyticsTotals } from 'src/engine/core-modules/application/application-registration-analytics/utils/build-application-registration-analytics-totals.util';
import { getApplicationRegistrationAnalyticsPeriodDates } from 'src/engine/core-modules/application/application-registration-analytics/utils/get-application-registration-analytics-period-dates.util';

// Installs fall back to an "unknown" version when the package has none, and semver throws on such strings
const compareVersionsNewestFirst = (left: string, right: string) => {
  const isLeftSemver = semver.valid(left) !== null;
  const isRightSemver = semver.valid(right) !== null;

  if (isLeftSemver && isRightSemver) {
    return semver.rcompare(left, right);
  }

  if (isLeftSemver !== isRightSemver) {
    return isLeftSemver ? -1 : 1;
  }

  return right.localeCompare(left);
};

export const buildApplicationRegistrationAnalyticsVersions = ({
  cells,
  activeWorkspacesByVersion,
  dailyActiveWorkspacesByVersion,
  periodStart,
  periodEnd,
}: {
  cells: ApplicationRegistrationMetricCellRow[];
  activeWorkspacesByVersion: ApplicationRegistrationVersionActiveWorkspacesRow[];
  dailyActiveWorkspacesByVersion: ApplicationRegistrationDailyVersionActiveWorkspacesRow[];
  periodStart: Date;
  periodEnd: Date;
}): ApplicationRegistrationAnalyticsVersionDTO[] => {
  const periodDates = getApplicationRegistrationAnalyticsPeriodDates({
    periodStart,
    periodEnd,
  });

  const versions = new Set(
    [...cells, ...activeWorkspacesByVersion]
      .map((row) => row.version)
      .filter((version) => version !== ''),
  );

  return [...versions]
    .sort(compareVersionsNewestFirst)
    .slice(0, APPLICATION_REGISTRATION_ANALYTICS_VERSION_LIMIT)
    .map((version) => {
      const activeWorkspacesByDate = new Map(
        dailyActiveWorkspacesByVersion
          .filter((row) => row.version === version)
          .map((row) => [row.date, Number(row.activeWorkspaces)]),
      );

      return {
        version,
        ...buildApplicationRegistrationAnalyticsTotals({
          rows: cells.filter((cell) => cell.version === version),
          activeWorkspaces: Number(
            activeWorkspacesByVersion.find((row) => row.version === version)
              ?.activeWorkspaces ?? 0,
          ),
        }),
        timeSeries: periodDates.map((date) => ({
          date,
          activeWorkspaces: activeWorkspacesByDate.get(date) ?? 0,
        })),
      };
    });
};
