import { isNonEmptyString } from '@sniptt/guards';

import { parseClickHouseDateTime } from 'src/database/clickhouse/utils/parse-clickhouse-date-time.util';
import { type ApplicationMonitoringDTO } from 'src/engine/core-modules/application/application-monitoring/dtos/application-monitoring.dto';
import { type ApplicationMonitoringRows } from 'src/engine/core-modules/application/application-monitoring/types/application-monitoring-rows.type';
import { type ApplicationMonitoringPeriod } from 'src/engine/core-modules/application/application-monitoring/utils/resolve-application-monitoring-period.util';

const toNumber = (value: number | string | undefined): number =>
  Number(value ?? 0);

export const mapApplicationMonitoringRows = ({
  period,
  lookbackInHours,
  rows,
}: {
  period: ApplicationMonitoringPeriod;
  lookbackInHours: number;
  rows: ApplicationMonitoringRows;
}): ApplicationMonitoringDTO => {
  const [totals] = rows.totals;

  return {
    ...period,
    lookbackInHours,
    runCount: toNumber(totals?.runCount),
    failedRunCount: toNumber(totals?.failedRunCount),
    lifecycleFailureCount: toNumber(totals?.lifecycleFailureCount),
    rateLimitEventCount: toNumber(totals?.rateLimitEventCount),
    activity: rows.activity.map((row) => ({
      bucketStart: parseClickHouseDateTime(row.bucketStart),
      errorCount: toNumber(row.errorCount),
      warningCount: toNumber(row.warningCount),
      infoCount: toNumber(row.infoCount),
    })),
    lifecycle: rows.lifecycle.map((row) => ({
      bucketStart: parseClickHouseDateTime(row.bucketStart),
      installCount: toNumber(row.installCount),
      upgradeCount: toNumber(row.upgradeCount),
      uninstallCount: toNumber(row.uninstallCount),
      failedCount: toNumber(row.failedCount),
    })),
    issues: rows.issues.map((row) => ({
      level: row.level,
      source: row.source,
      errorCode: row.errorCode,
      logicFunctionName: row.logicFunctionName,
      versions: row.versions.filter(isNonEmptyString).sort(),
      eventCount: toNumber(row.eventCount),
      affectedInstallCount: toNumber(row.affectedInstallCount),
      lastSeenAt: parseClickHouseDateTime(row.lastSeenAt),
    })),
    versions: rows.versions.map((row) => ({
      version: row.version,
      runCount: toNumber(row.runCount),
      failedRunCount: toNumber(row.failedRunCount),
      activeInstallCount: toNumber(row.activeInstallCount),
    })),
    functions: rows.functions.map((row) => ({
      logicFunctionName: row.logicFunctionName,
      runCount: toNumber(row.runCount),
      failedRunCount: toNumber(row.failedRunCount),
      p95DurationMs: Math.round(toNumber(row.p95DurationMs)),
    })),
  };
};
