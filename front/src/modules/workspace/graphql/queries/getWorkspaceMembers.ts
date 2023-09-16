import { gql } from '@apollo/client';

export const GET_WORKSPACE_MEMBERS = gql`
  query GetWorkspaceMembers($where: WorkspaceMemberWhereInput) {
    workspaceMembers: findManyWorkspaceMember(where: $where) {
      id
      user {
        id
        email
        avatarUrl
        firstName
        lastName
        displayName
      }
    }
  }
`;
