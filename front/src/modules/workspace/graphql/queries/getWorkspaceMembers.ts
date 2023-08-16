import { gql } from '@apollo/client';

export const GET_WORKSPACE_MEMBERS = gql`
  query GetWorkspaceMembers {
    workspaceMembers: findManyWorkspaceMember {
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
