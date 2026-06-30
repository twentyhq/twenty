import { gql } from '@apollo/client';

export const EVENT_LOGS_LIVE_SUBSCRIPTION = gql`
  subscription EventLogsLive($table: EventLogTable!) {
    eventLogsLive(table: $table) {
      event
      timestamp
      userId
      properties
      recordId
      objectMetadataId
    }
  }
`;
