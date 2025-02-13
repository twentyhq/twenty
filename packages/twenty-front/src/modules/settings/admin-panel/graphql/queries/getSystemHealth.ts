import { gql } from '@apollo/client';

export const GET_SYSTEM_HEALTH = gql`
  query GetSystemHealth {
    adminSystemHealth {
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
