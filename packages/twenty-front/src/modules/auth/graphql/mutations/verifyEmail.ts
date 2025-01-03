import { gql } from '@apollo/client';

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail(
    $emailVerificationToken: String!
    $captchaToken: String
  ) {
    verifyEmail(emailVerificationToken: $emailVerificationToken) {
      success
      email
    }
  }
`;
