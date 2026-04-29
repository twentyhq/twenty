import { gql } from '@apollo/client';

export const DISMISS_MAINTENANCE_MODE_BANNER = gql`
  mutation DismissMaintenanceModeBanner {
    dismissMaintenanceModeBanner
  }
`;
