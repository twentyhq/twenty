import { gql } from '@apollo/client';

export const SEARCH_ACTIVITY_QUERY = gql`
  query SearchActivity(
    $where: ActivityWhereInput
    $limit: Int
    $orderBy: [ActivityOrderByWithRelationInput!]
  ) {
    searchResults: findManyActivities(
      where: $where
      take: $limit
      orderBy: $orderBy
    ) {
      id
      title
      body
    }
  }
`;
