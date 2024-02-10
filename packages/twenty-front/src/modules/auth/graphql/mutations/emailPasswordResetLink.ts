import { gql } from '@apollo/client';

export const EMAIL_PASSWORD_RESET_Link = gql`
  mutation EmailPasswordResetLink($email: String!) {
    emailPasswordResetLink(email: $email) {
      success
    }
  }
`;
