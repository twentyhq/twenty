import { gql } from '@apollo/client';

export const GET_EVENT_LOGS = gql`
  query EventLogs($input: EventLogQueryInput!) {
    eventLogs(input: $input) {
      records {
        event
        timestamp
        userWorkspaceId
        properties
        recordId
        objectMetadataId
        isCustom
      }
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
