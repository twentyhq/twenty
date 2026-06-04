// The five event streams that land in ClickHouse, expressed as a single
// transport envelope. Each variant carries a fully-built row for its ClickHouse
// table; a sink routes purely on `table`. This unifies the transport/sink layer
// while keeping the producers semantically distinct.
//
// The row shapes mirror the columns each table is written with. They are the
// write-side counterpart of the read-side records in
// event-logs/event-logs.service.ts.

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

type PageviewRow = EventContextFields & {
  type: 'page';
  name: string;
  properties: Record<string, unknown>;
  timestamp: string;
  version: string;
};

type ObjectEventRow = AnalyticsEventRow & {
  recordId: string;
  objectMetadataId: string;
  isCustom?: boolean;
};

type UsageEventRow = {
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

type ApplicationLogRow = {
  timestamp: string;
  workspaceId: string;
  applicationId: string;
  logicFunctionId: string;
  logicFunctionName: string;
  executionId: string;
  level: string;
  message: string;
};

export type WorkspaceEventEnvelope =
  | { table: 'workspaceEvent'; row: AnalyticsEventRow }
  | { table: 'pageview'; row: PageviewRow }
  | { table: 'objectEvent'; row: ObjectEventRow }
  | { table: 'usageEvent'; row: UsageEventRow }
  | { table: 'applicationLog'; row: ApplicationLogRow };

export type WorkspaceEventTable = WorkspaceEventEnvelope['table'];

// Payload of a job on MessageQueue.workspaceEventsQueue.
export type WorkspaceEventsJobData = {
  events: WorkspaceEventEnvelope[];
};

// Job name on MessageQueue.workspaceEventsQueue, kept here (not on the consumer
// class) so producers can enqueue without importing the consumer.
export const WORKSPACE_EVENTS_JOB_NAME = 'WorkspaceEventsConsumer';
