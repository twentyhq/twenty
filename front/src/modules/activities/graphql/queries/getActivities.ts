import { gql } from '@apollo/client';

export const GET_ACTIVITIES = gql`
  query GetActivities(
    $where: ActivityWhereInput!
    $orderBy: [ActivityOrderByWithRelationInput!]
  ) {
    findManyActivities(orderBy: $orderBy, where: $where) {
      ...ActivityQueryFragment
    }
  }
`;
