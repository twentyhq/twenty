export type EventLogFiltersState = {
  eventType?: string;
  userWorkspaceId?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  recordId?: string;
  objectMetadataId?: string;
};
