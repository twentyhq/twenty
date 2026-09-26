import { gql } from '@apollo/client';

export const EVENT_LOGS_LIVE_SUBSCRIPTION = gql`
  subscription EventLogsLive(
    $table: EventLogTable!
    $fieldFilters: [EventLogFieldFilterInput!]
    $search: String
  ) {
    eventLogsLive(table: $table, fieldFilters: $fieldFilters, search: $search) {
      event
      timestamp
      userId
      properties
      recordId
      objectMetadataId
    }
  }
`;
