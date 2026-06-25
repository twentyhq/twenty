import { gql } from '@apollo/client';

export const GET_MAINTENANCE_MODE = gql`
  query GetMaintenanceMode {
    getMaintenanceMode {
      startAt
      endAt
      link
    }
  }
`;
