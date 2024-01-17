import { gql } from '@apollo/client';

export const EMAIL_PASSWORD_RESET_Link = gql`
  mutation EmailPasswordResetLink {
    emailPasswordResetLink {
      success
    }
  }
`;
