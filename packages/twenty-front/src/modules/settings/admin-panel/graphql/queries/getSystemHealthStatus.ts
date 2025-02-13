import { gql } from '@apollo/client';

export const GET_SYSTEM_HEALTH_STATUS = gql`
  query GetSystemHealthStatus {
    getSystemHealthStatus {
      database {
        status
      }
      redis {
        status
      }
      worker {
        status
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
