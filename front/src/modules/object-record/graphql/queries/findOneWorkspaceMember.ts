import { gql } from '@apollo/client';

export const FIND_ONE_WORKSPACE_MEMBER = gql`
  query FindOneWorkspaceMember($filter: WorkspaceMemberFilterInput) {
    workspaceMembers(filter: $filter) {
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
