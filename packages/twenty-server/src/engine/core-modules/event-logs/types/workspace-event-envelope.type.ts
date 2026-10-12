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

// Carries a keyed workspace hash instead of the id: these rows are read by app owners, not by the workspace
export type ApplicationRegistrationMetricRow = {
  timestamp: string;
  applicationRegistrationId: string;
  universalIdentifier: string;
  version: string;
  metric: string;
  dimension: string;
  context: string;
  workspaceHash: string;
  value: number;
};

// Every table but applicationRegistrationMetric is also queryable through the registry (EVENT_LOG_TYPES),
// whose clickHouseTable values must match these literals.
export type WorkspaceEventEnvelope =
  | { table: 'workspaceEvent'; row: AnalyticsEventRow }
  | { table: 'pageview'; row: PageviewRow }
  | { table: 'objectEvent'; row: ObjectEventRow }
  | { table: 'usageEvent'; row: UsageEventRow }
  | { table: 'applicationLog'; row: ApplicationLogRow }
  | {
      table: 'applicationRegistrationMetric';
      row: ApplicationRegistrationMetricRow;
    };

export type WorkspaceEventTable = WorkspaceEventEnvelope['table'];
