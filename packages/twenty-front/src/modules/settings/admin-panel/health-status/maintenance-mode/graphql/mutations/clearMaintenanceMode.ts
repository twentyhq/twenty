import { gql } from '@apollo/client';

export const CLEAR_MAINTENANCE_MODE = gql`
  mutation ClearMaintenanceMode {
    clearMaintenanceMode
  }
`;
