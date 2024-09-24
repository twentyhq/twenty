import { gql } from '@apollo/client';

export const RESEND_WORKSPACE_INVITATION = gql`
  mutation ResendWorkspaceInvitation($appTokenId: String!) {
    resendWorkspaceInvitation(appTokenId: $appTokenId) {
      success
      errors
      result {
        ... on WorkspaceInvitation {
          id
          email
          expiresAt
        }
      }
    }
  }
`;
