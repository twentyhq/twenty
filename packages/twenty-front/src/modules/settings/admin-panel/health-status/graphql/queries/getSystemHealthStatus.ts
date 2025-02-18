import { gql } from '@apollo/client';

export const GET_SYSTEM_HEALTH_STATUS = gql`
  query GetSystemHealthStatus {
    getSystemHealthStatus {
      database
      redis
      worker
      accountSync
    }
  }
`;
