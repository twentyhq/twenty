import { gql } from '@apollo/client';

export const VALIDATE_PASSWORD_RESET_TOKEN = gql`
  query validatePasswordResetToken($token: String!) {
    validatePasswordResetToken(passwordResetToken: $token) {
      id
      email
    }
  }
`;
