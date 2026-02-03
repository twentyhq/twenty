// Re-export EventLogTable from twenty-shared for consistent usage
export { EventLogTable } from 'twenty-shared/types';

// Types matching the GraphQL schema - these will be auto-generated once schema is synced
export type EventLogRecord = {
  event: string;
  timestamp: string;
  userId?: string | null;
  properties?: Record<string, unknown> | null;
  recordId?: string | null;
  objectMetadataId?: string | null;
  isCustom?: boolean | null;
};

export type EventLogPageInfo = {
  endCursor?: string | null;
  hasNextPage: boolean;
};

export type EventLogQueryResult = {
  records: EventLogRecord[];
  totalCount: number;
  pageInfo: EventLogPageInfo;
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
  table: string;
  filters?: EventLogFiltersInput;
  first?: number;
  after?: string;
};
