import { gql } from '@apollo/client';

export const SET_MAINTENANCE_MODE = gql`
  mutation SetMaintenanceMode(
    $startAt: String!
    $endAt: String!
    $link: String
  ) {
    setMaintenanceMode(startAt: $startAt, endAt: $endAt, link: $link)
  }
`;
