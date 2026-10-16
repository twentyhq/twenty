import { gql } from '@apollo/client';

export const GET_EVENT_LOGS = gql`
  query EventLogs($input: EventLogQueryInput!) {
    eventLogs(input: $input) {
      records {
        event
        timestamp
        userId
        properties
        recordId
        objectMetadataId
      }
      canQueryInstanceLevel
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
