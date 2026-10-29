import { isNonEmptyString } from '@sniptt/guards';
import { type BillableOperations } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { parseClickHouseDateTime } from 'src/database/clickhouse/utils/parse-clickhouse-date-time.util';
import { type ApplicationMonitoringDTO } from 'src/engine/core-modules/application/application-monitoring/dtos/application-monitoring.dto';
import {
  type ApplicationMonitoringCreditUsageRow,
  type ApplicationMonitoringRows,
} from 'src/engine/core-modules/application/application-monitoring/types/application-monitoring-rows.type';
import { type ApplicationMonitoringPeriod } from 'src/engine/core-modules/application/application-monitoring/utils/resolve-application-monitoring-period.util';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

const toNumber = (value: number | string | undefined): number =>
  Number(value ?? 0);

// Resolved against the latest manifest, so an operation renamed or dropped since falls back to its operationType
const groupCreditUsageByOperationLabel = ({
  rows,
  billableOperations,
}: {
  rows: ApplicationMonitoringCreditUsageRow[];
  billableOperations: BillableOperations;
}) => {
  const bucketsByKey = new Map<
    string,
    {
      bucketStart: Date;
      operationType: string;
      operationLabel: string | null;
      creditsUsedMicro: number;
    }
  >();

  for (const row of rows) {
    // Own-property only: an operation named `constructor` must not resolve to an inherited value
    const operationLabel = Object.prototype.hasOwnProperty.call(
      billableOperations,
      row.operation,
    )
      ? (billableOperations[row.operation]?.label ?? null)
      : null;
    const key = `${row.bucketStart.toISOString()}|${row.operationType}|${operationLabel ?? ''}`;
    const bucket = bucketsByKey.get(key);

    if (isDefined(bucket)) {
      bucket.creditsUsedMicro += row.creditsUsedMicro;
    } else {
      bucketsByKey.set(key, {
        bucketStart: row.bucketStart,
        operationType: row.operationType,
        operationLabel,
        creditsUsedMicro: row.creditsUsedMicro,
      });
    }
  }

  return [...bucketsByKey.values()];
};

export const mapApplicationMonitoringRows = ({
  period,
  lookbackInHours,
  rows,
  creditUsage,
}: {
  period: ApplicationMonitoringPeriod;
  lookbackInHours: number;
  rows: ApplicationMonitoringRows;
  creditUsage: {
    rows: ApplicationMonitoringCreditUsageRow[];
    billableOperations: BillableOperations;
  } | null;
}): ApplicationMonitoringDTO => {
  const [totals] = rows.totals;
  const creditUsageBuckets = isDefined(creditUsage)
    ? groupCreditUsageByOperationLabel(creditUsage)
    : null;

  return {
    ...period,
    lookbackInHours,
    runCount: toNumber(totals?.runCount),
    failedRunCount: toNumber(totals?.failedRunCount),
    lifecycleFailureCount: toNumber(totals?.lifecycleFailureCount),
    rateLimitEventCount: toNumber(totals?.rateLimitEventCount),
    creditsUsed: isDefined(creditUsageBuckets)
      ? toDisplayCredits(
          creditUsageBuckets.reduce(
            (total, bucket) => total + bucket.creditsUsedMicro,
            0,
          ),
        )
      : null,
    activity: rows.activity.map((row) => ({
      bucketStart: parseClickHouseDateTime(row.bucketStart),
      errorCount: toNumber(row.errorCount),
      rateLimitedRequestCount: toNumber(row.rateLimitedRequestCount),
      rateLimitedJobCount: toNumber(row.rateLimitedJobCount),
    })),
    lifecycle: rows.lifecycle.map((row) => ({
      bucketStart: parseClickHouseDateTime(row.bucketStart),
      installCount: toNumber(row.installCount),
      upgradeCount: toNumber(row.upgradeCount),
      uninstallCount: toNumber(row.uninstallCount),
      failedCount: toNumber(row.failedCount),
    })),
    creditUsage:
      creditUsageBuckets?.map((bucket) => ({
        bucketStart: bucket.bucketStart,
        operationType: bucket.operationType,
        operationLabel: bucket.operationLabel,
        creditsUsed: toDisplayCredits(bucket.creditsUsedMicro),
      })) ?? null,
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
