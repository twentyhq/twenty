import { gql } from '@apollo/client';

export const GET_APPLICATION_LOG_ACTIVITY = gql`
  query ApplicationLogActivity($input: EventLogQueryInput!) {
    eventLogs(input: $input) {
      activity {
        start
        end
        info
        warning
        error
      }
    }
  }
`;
