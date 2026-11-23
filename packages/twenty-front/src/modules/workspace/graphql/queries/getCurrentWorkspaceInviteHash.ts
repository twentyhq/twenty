import { gql } from '@apollo/client';

export const GET_CURRENT_WORKSPACE_INVITE_HASH = gql`
  query GetCurrentWorkspaceInviteHash {
    currentWorkspace {
      id
      inviteHash
    }
  }
`;
