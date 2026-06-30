import { gql } from '@apollo/client';

export const IS_MAINTENANCE_MODE_BANNER_DISMISSED = gql`
  query IsMaintenanceModeBannerDismissed {
    isMaintenanceModeBannerDismissed
  }
`;
