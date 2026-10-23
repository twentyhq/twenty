type ClickHouseCount = number | string;

export type ApplicationMonitoringTotalsRow = {
  runCount: ClickHouseCount;
  failedRunCount: ClickHouseCount;
  lifecycleFailureCount: ClickHouseCount;
  rateLimitEventCount: ClickHouseCount;
};

export type ApplicationMonitoringActivityRow = {
  bucketStart: string;
  errorCount: ClickHouseCount;
  rateLimitedRequestCount: ClickHouseCount;
  rateLimitedJobCount: ClickHouseCount;
};

export type ApplicationMonitoringLifecycleRow = {
  bucketStart: string;
  installCount: ClickHouseCount;
  upgradeCount: ClickHouseCount;
  uninstallCount: ClickHouseCount;
  failedCount: ClickHouseCount;
};

export type ApplicationMonitoringIssueRow = {
  level: string;
  source: string;
  errorCode: string;
  logicFunctionName: string;
  versions: string[];
  eventCount: ClickHouseCount;
  affectedInstallCount: ClickHouseCount;
  lastSeenAt: string;
};

export type ApplicationMonitoringVersionRow = {
  version: string;
  runCount: ClickHouseCount;
  failedRunCount: ClickHouseCount;
  activeInstallCount: ClickHouseCount;
};

export type ApplicationMonitoringFunctionRow = {
  logicFunctionName: string;
  runCount: ClickHouseCount;
  failedRunCount: ClickHouseCount;
  p95DurationMs: ClickHouseCount;
};

export type ApplicationMonitoringRows = {
  totals: ApplicationMonitoringTotalsRow[];
  activity: ApplicationMonitoringActivityRow[];
  lifecycle: ApplicationMonitoringLifecycleRow[];
  issues: ApplicationMonitoringIssueRow[];
  versions: ApplicationMonitoringVersionRow[];
  functions: ApplicationMonitoringFunctionRow[];
};

export type ApplicationMonitoringActiveWorkspaceCountRow = {
  activeWorkspaceCount: ClickHouseCount;
};

export type ApplicationMonitoringWorkspaceRow = {
  workspaceId: string;
  applicationVersion: string;
  runCount: ClickHouseCount;
  failedRunCount: ClickHouseCount;
  rateLimitEventCount: ClickHouseCount;
  lastEventAt: string;
};
