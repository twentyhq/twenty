import { gql } from '@apollo/client';

export const RESET_TWO_FACTOR_AUTHENTICATION = gql`
  mutation resetTwoFactorAuthenticationMethod(
    $origin: String!
    $twoFactorAuthenticationMethodId: String!
  ) {
    resetTwoFactorAuthenticationMethod(
      origin: $origin
      twoFactorAuthenticationMethodId: $twoFactorAuthenticationMethodId
    ) {
      success
    }
  }
`;
