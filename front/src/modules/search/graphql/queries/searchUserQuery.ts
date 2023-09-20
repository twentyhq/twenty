import { gql } from '@apollo/client';

export const SEARCH_USER_QUERY = gql`
  query SearchUser(
    $where: UserWhereInput
    $limit: Int
    $orderBy: [UserOrderByWithRelationInput!]
  ) {
    searchResults: findManyUser(
      where: $where
      take: $limit
      orderBy: $orderBy
    ) {
      ...userFieldsFragment
      avatarUrl
    }
  }
`;
