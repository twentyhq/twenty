import { gql } from '@apollo/client';

export const EMAIL_PASSWORD_RESET_LINK = gql`
  mutation EmailPasswordResetLink($email: String!, $workspaceId: UUID!) {
    emailPasswordResetLink(email: $email, workspaceId: $workspaceId) {
      success
    }
  }
`;
