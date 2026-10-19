import { gql } from '@apollo/client';

export const FIND_ADMIN_APPLICATION_REGISTRATION_LOGS = gql`
  query FindAdminApplicationRegistrationLogs(
    $input: AdminApplicationLogsInput!
  ) {
    findAdminApplicationRegistrationLogs(input: $input) {
      records {
        event
        timestamp
        properties
      }
      totalCount
      pageInfo {
        hasNextPage
      }
    }
  }
`;
