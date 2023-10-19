import { gql } from '@apollo/client';

export const SEARCH_USER_QUERY = gql`
  query SearchWorkspaceMember(
    $where: WorkspaceMemberWhereInput
    $limit: Int
    $orderBy: [WorkspaceMemberOrderByWithRelationInput!]
  ) {
    searchResults: findManyWorkspaceMember(
      where: $where
      take: $limit
      orderBy: $orderBy
    ) {
      ...workspaceMemberFieldsFragment
      user {
        avatarUrl
        ...userFieldsFragment
      }
    }
  }
`;
