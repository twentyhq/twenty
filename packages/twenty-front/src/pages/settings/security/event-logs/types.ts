// Temporary type definitions until GraphQL codegen generates them
// These will be replaced by the generated types from ~/generated-metadata/graphql

// GraphQL enums use the keys, not the values
export enum EventLogTable {
  WORKSPACE_EVENT = 'WORKSPACE_EVENT',
  PAGEVIEW = 'PAGEVIEW',
  OBJECT_EVENT = 'OBJECT_EVENT',
}

export type EventLogRecord = {
  event: string;
  timestamp: string;
  userId?: string | null;
  properties?: Record<string, unknown> | null;
  recordId?: string | null;
  objectMetadataId?: string | null;
  isCustom?: boolean | null;
};

export type EventLogQueryResult = {
  records: EventLogRecord[];
  totalCount: number;
  hasNextPage: boolean;
};

export type EventLogFiltersInput = {
  eventType?: string;
  userId?: string;
  workspaceMemberId?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  recordId?: string;
  objectMetadataId?: string;
};

export type EventLogQueryInput = {
  table: EventLogTable;
  filters?: EventLogFiltersInput;
  limit?: number;
  offset?: number;
};
