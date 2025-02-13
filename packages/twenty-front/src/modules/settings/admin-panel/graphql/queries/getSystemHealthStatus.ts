import { gql } from '@apollo/client';

export const GET_SYSTEM_HEALTH_STATUS = gql`
  query GetSystemHealthStatus {
    getSystemHealthStatus {
      database {
        status
        details
      }
      redis {
        status
        details
      }
      worker {
        status
        queues {
          name
          workers
          status
        }
      }
      messageSync {
        NOT_SYNCED
        ONGOING
        ACTIVE
        FAILED_INSUFFICIENT_PERMISSIONS
        FAILED_UNKNOWN
      }
    }
  }
`;
