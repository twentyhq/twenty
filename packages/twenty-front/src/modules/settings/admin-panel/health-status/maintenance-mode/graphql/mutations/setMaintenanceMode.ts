import { gql } from '@apollo/client';

export const SET_MAINTENANCE_MODE = gql`
  mutation SetMaintenanceMode(
    $startAt: DateTime!
    $endAt: DateTime!
    $link: String
  ) {
    setMaintenanceMode(startAt: $startAt, endAt: $endAt, link: $link)
  }
`;
