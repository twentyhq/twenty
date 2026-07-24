export type EventContextFields = {
  workspaceId?: string | null;
  userId?: string | null;
};

type AnalyticsEventRow = EventContextFields & {
  type: 'track';
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
  version: string;
};

export type PageviewRow = EventContextFields & {
  type: 'page';
  name: string;
  properties: Record<string, unknown>;
  timestamp: string;
  version: string;
};

export type ObjectEventRow = AnalyticsEventRow & {
  recordId: string;
  objectMetadataId: string;
  isCustom?: boolean;
};

export type UsageEventRow = {
  timestamp: string;
  workspaceId: string;
  periodStart?: string;
  userWorkspaceId: string;
  resourceType: string;
  operationType: string;
  quantity: number;
  unit: string;
  creditsUsedMicro: number;
  resourceId: string;
  resourceContext: string;
  metadata: Record<string, unknown>;
};

export type ApplicationLogRow = {
  timestamp: string;
  workspaceId: string;
  applicationId: string;
  logicFunctionId: string;
  logicFunctionName: string;
  executionId: string;
  level: string;
  message: string;
};

export type LogicFunctionExecutionRow = {
  timestamp: string;
  workspaceId: string;
  applicationId: string;
  logicFunctionId: string;
  logicFunctionName: string;
  executionId: string;
  status: string;
  errorType: string;
  durationMs: number;
  creditsUsedMicro: number;
  source: string;
  workflowId: string;
  workflowVersionId: string;
  workflowRunId: string;
  executionMode: string;
};

// The `table` literals must match the registry's clickHouseTable values (EVENT_LOG_TYPES).
export type WorkspaceEventEnvelope =
  | { table: 'workspaceEvent'; row: AnalyticsEventRow }
  | { table: 'pageview'; row: PageviewRow }
  | { table: 'objectEvent'; row: ObjectEventRow }
  | { table: 'usageEvent'; row: UsageEventRow }
  | { table: 'applicationLog'; row: ApplicationLogRow }
  | { table: 'logicFunctionExecution'; row: LogicFunctionExecutionRow };

export type WorkspaceEventTable = WorkspaceEventEnvelope['table'];
