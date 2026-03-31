import { gql } from '@apollo/client';

export type GetMaintenanceModeResult = {
  getMaintenanceMode: {
    startAt: string;
    endAt: string;
    link?: string;
  } | null;
};

export const GET_MAINTENANCE_MODE = gql`
  query GetMaintenanceMode {
    getMaintenanceMode {
      startAt
      endAt
      link
    }
  }
`;
