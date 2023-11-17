import { gql } from '@apollo/client';

export const FIND_ONE_WORKSPACE_MEMBER_V2 = gql`
  query FindManyWorkspaceMembersV2($filter: WorkspaceMemberV2FilterInput) {
    workspaceMembersV2(filter: $filter) {
      edges {
        node {
          id
          name {
            firstName
            lastName
          }
          colorScheme
          avatarUrl
          locale
          allowImpersonation
        }
      }
    }
  }
`;
