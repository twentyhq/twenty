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

export const GET_WORKSPACE_FROM_INVITE_HASH = gql`
  query GetWorkspaceFromInviteHash($inviteHash: String!) {
    findWorkspaceFromInviteHash(inviteHash: $inviteHash) {
      id
      displayName
      logo
    }
  }
`;
