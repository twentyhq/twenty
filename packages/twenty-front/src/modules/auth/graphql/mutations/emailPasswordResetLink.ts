import { gql } from '@apollo/client';

export const EMAIL_PASSWORD_RESET_LINK = gql`
  mutation EmailPasswordResetLink(
    $email: String!
    $workspaceId: UUID
    $captchaToken: String
  ) {
    emailPasswordResetLink(
      email: $email
      workspaceId: $workspaceId
      captchaToken: $captchaToken
    ) {
      success
    }
  }
`;
