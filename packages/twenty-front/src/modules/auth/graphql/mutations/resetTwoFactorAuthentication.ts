import { gql } from '@apollo/client';

export const RESET_TWO_FACTOR_AUTHENTICATION = gql`
  mutation resetTwoFactorAuthenticationMethod(
    $twoFactorAuthenticationMethodId: String!
  ) {
    resetTwoFactorAuthenticationMethod(
      twoFactorAuthenticationMethodId: $twoFactorAuthenticationMethodId
    ) {
      success
    }
  }
`;
