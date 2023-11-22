import { gql } from '@apollo/client';

export const GET_WORKSPACE_FROM_INVITE_HASH = gql`
  query GetWorkspaceFromInviteHash($inviteHash: String!) {
    findWorkspaceFromInviteHash(inviteHash: $inviteHash) {
      id
      displayName
      logo
      allowImpersonation
    }
  }
`;
