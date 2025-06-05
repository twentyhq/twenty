import { gql } from '@apollo/client';

export const CHECK_USER_EXISTS = gql`
  query CheckUserExists($email: String!, $captchaToken: String) {
    checkUserExists(email: $email, captchaToken: $captchaToken) {
      exists
      availableWorkspacesCount
      isEmailVerified
    }
  }
`;
