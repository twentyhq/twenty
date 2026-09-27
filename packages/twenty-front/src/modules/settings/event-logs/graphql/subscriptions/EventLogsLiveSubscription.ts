import { gql } from '@apollo/client';

export const EVENT_LOGS_LIVE_SUBSCRIPTION = gql`
  subscription EventLogsLive(
    $table: EventLogTable!
    $fieldFilters: [EventLogFieldFilterInput!]
  ) {
    eventLogsLive(table: $table, fieldFilters: $fieldFilters) {
      event
      timestamp
      userId
      properties
      recordId
      objectMetadataId
    }
  }
`;
