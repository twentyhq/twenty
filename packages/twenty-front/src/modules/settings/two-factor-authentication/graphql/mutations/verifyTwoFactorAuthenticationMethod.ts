import { gql } from '@apollo/client';

export const VERIFY_TWO_FACTOR_AUTHENTICATION_METHOD_FOR_AUTHENTICATED_USER = gql`
  mutation verifyTwoFactorAuthenticationMethodForAuthenticatedUser(
    $otp: String!
  ) {
    verifyTwoFactorAuthenticationMethodForAuthenticatedUser(otp: $otp) {
      success
    }
  }
`;
