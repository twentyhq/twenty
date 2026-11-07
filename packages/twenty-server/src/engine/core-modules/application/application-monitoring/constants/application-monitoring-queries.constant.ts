import { APPLICATION_MONITORING_BREAKDOWN_LIMIT } from 'src/engine/core-modules/application/application-monitoring/constants/application-monitoring-breakdown-limit.constant';
import { APPLICATION_MONITORING_WORKSPACE_BREAKDOWN_LIMIT } from 'src/engine/core-modules/application/application-monitoring/constants/application-monitoring-workspace-breakdown-limit.constant';

const PERIOD_FILTER = `applicationRegistrationId = {applicationRegistrationId:String}
  AND timestamp >= {periodStart:DateTime64(3)}
  AND timestamp < {periodEnd:DateTime64(3)}
  AND ({workspaceId:String} = '' OR workspaceId = {workspaceId:String})`;

const LIFECYCLE_SOURCES = `('INSTALL', 'UPGRADE', 'UNINSTALL')`;

const RATE_LIMIT_SOURCES = `('API_RATE_LIMIT', 'JOB_RATE_LIMIT')`;

const RUNS_ON_VERSION = `NOT (source IN ${LIFECYCLE_SOURCES} AND level = 'ERROR')`;

const BUCKET_START = `toStartOfInterval(timestamp, toIntervalSecond({bucketSizeInSeconds:UInt32}))`;

export const APPLICATION_MONITORING_QUERIES = {
  totals: `
    SELECT
      sumIf(occurrenceCount, source = 'LOGIC_FUNCTION') AS runCount,
      sumIf(occurrenceCount, source = 'LOGIC_FUNCTION' AND level = 'ERROR') AS failedRunCount,
      sumIf(occurrenceCount, source IN ${LIFECYCLE_SOURCES} AND level = 'ERROR') AS lifecycleFailureCount,
      sumIf(occurrenceCount, source IN ${RATE_LIMIT_SOURCES}) AS rateLimitEventCount
    FROM applicationMetricEvent
    WHERE ${PERIOD_FILTER}`,
  activity: `
    SELECT
      ${BUCKET_START} AS bucketStart,
      sumIf(occurrenceCount, level = 'ERROR') AS errorCount,
      sumIf(occurrenceCount, source = 'API_RATE_LIMIT') AS rateLimitedRequestCount,
      sumIf(occurrenceCount, source = 'JOB_RATE_LIMIT') AS rateLimitedJobCount
    FROM applicationMetricEvent
    WHERE ${PERIOD_FILTER}
    GROUP BY bucketStart
    ORDER BY bucketStart`,
  lifecycle: `
    SELECT
      ${BUCKET_START} AS bucketStart,
      sumIf(occurrenceCount, source = 'INSTALL' AND level != 'ERROR') AS installCount,
      sumIf(occurrenceCount, source = 'UPGRADE' AND level != 'ERROR') AS upgradeCount,
      sumIf(occurrenceCount, source = 'UNINSTALL' AND level != 'ERROR') AS uninstallCount,
      sumIf(occurrenceCount, level = 'ERROR') AS failedCount
    FROM applicationMetricEvent
    WHERE ${PERIOD_FILTER} AND source IN ${LIFECYCLE_SOURCES}
    GROUP BY bucketStart
    ORDER BY bucketStart`,
  issues: `
    SELECT
      level,
      source,
      errorCode,
      logicFunctionName,
      groupUniqArray(applicationVersion) AS versions,
      sum(occurrenceCount) AS eventCount,
      uniqExact(workspaceId) AS affectedInstallCount,
      max(timestamp) AS lastSeenAt
    FROM applicationMetricEvent
    WHERE ${PERIOD_FILTER} AND level IN ('ERROR', 'WARN')
    GROUP BY level, source, errorCode, logicFunctionName
    ORDER BY eventCount DESC
    LIMIT ${APPLICATION_MONITORING_BREAKDOWN_LIMIT}`,
  versions: `
    SELECT
      applicationVersion AS version,
      sumIf(occurrenceCount, source = 'LOGIC_FUNCTION') AS runCount,
      sumIf(occurrenceCount, source = 'LOGIC_FUNCTION' AND level = 'ERROR') AS failedRunCount,
      uniqExact(workspaceId) AS activeInstallCount
    FROM applicationMetricEvent
    WHERE ${PERIOD_FILTER} AND applicationVersion != '' AND ${RUNS_ON_VERSION}
    GROUP BY version
    ORDER BY activeInstallCount DESC, version DESC
    LIMIT ${APPLICATION_MONITORING_BREAKDOWN_LIMIT}`,
  functions: `
    SELECT
      logicFunctionName,
      sum(occurrenceCount) AS runCount,
      sumIf(occurrenceCount, level = 'ERROR') AS failedRunCount,
      quantile(0.95)(durationMs) AS p95DurationMs
    FROM applicationMetricEvent
    WHERE ${PERIOD_FILTER} AND source = 'LOGIC_FUNCTION'
    GROUP BY logicFunctionName
    ORDER BY runCount DESC
    LIMIT ${APPLICATION_MONITORING_BREAKDOWN_LIMIT}`,
  activeWorkspaceCount: `
    SELECT uniqExact(workspaceId) AS activeWorkspaceCount
    FROM applicationMetricEvent
    WHERE ${PERIOD_FILTER}`,
  workspaces: `
    SELECT
      workspaceId,
      argMaxIf(applicationVersion, timestamp, ${RUNS_ON_VERSION}) AS applicationVersion,
      sumIf(occurrenceCount, source = 'LOGIC_FUNCTION') AS runCount,
      sumIf(occurrenceCount, source = 'LOGIC_FUNCTION' AND level = 'ERROR') AS failedRunCount,
      sumIf(occurrenceCount, source IN ${RATE_LIMIT_SOURCES}) AS rateLimitEventCount,
      max(timestamp) AS lastEventAt
    FROM applicationMetricEvent
    WHERE ${PERIOD_FILTER}
    GROUP BY workspaceId
    ORDER BY failedRunCount DESC, runCount DESC
    LIMIT ${APPLICATION_MONITORING_WORKSPACE_BREAKDOWN_LIMIT}`,
} as const;
