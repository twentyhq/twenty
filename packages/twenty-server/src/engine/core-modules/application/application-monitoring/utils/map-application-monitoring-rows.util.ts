import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { parseClickHouseDateTime } from 'src/database/clickhouse/utils/parse-clickhouse-date-time.util';
import { type ApplicationMonitoringDTO } from 'src/engine/core-modules/application/application-monitoring/dtos/application-monitoring.dto';
import {
  type ApplicationMonitoringCreditUsage,
  type ApplicationMonitoringRows,
} from 'src/engine/core-modules/application/application-monitoring/types/application-monitoring-rows.type';
import { type ApplicationMonitoringPeriod } from 'src/engine/core-modules/application/application-monitoring/utils/resolve-application-monitoring-period.util';
import { findDeclaredBillingCharge } from 'src/engine/core-modules/usage/utils/find-declared-billing-charge.util';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

const toNumber = (value: number | string | undefined): number =>
  Number(value ?? 0);

// Resolved against the latest manifest, so an operation renamed or dropped since falls back to its operationType
const groupCreditUsageByOperationLabel = ({
  rows,
  billing,
}: ApplicationMonitoringCreditUsage) => {
  const bucketsByKey = new Map<
    string,
    {
      bucketStart: Date;
      operationType: string;
      operationLabel: string | null;
      operationIcon: string | null;
      creditsUsedMicro: number;
    }
  >();

  for (const row of rows) {
    const declaredCharge = findDeclaredBillingCharge({
      billing,
      chargeName: row.operation,
    });
    const operationLabel = declaredCharge?.label ?? null;
    const key = `${row.bucketStart.toISOString()}|${row.operationType}|${operationLabel ?? ''}`;
    const bucket = bucketsByKey.get(key);

    if (isDefined(bucket)) {
      bucket.creditsUsedMicro += row.creditsUsedMicro;
    } else {
      bucketsByKey.set(key, {
        bucketStart: row.bucketStart,
        operationType: row.operationType,
        operationLabel,
        operationIcon: declaredCharge?.icon ?? null,
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
  creditUsage: ApplicationMonitoringCreditUsage | null;
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
        operationIcon: bucket.operationIcon,
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
