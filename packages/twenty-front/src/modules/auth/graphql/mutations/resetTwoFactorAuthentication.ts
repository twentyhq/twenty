import { gql } from '@apollo/client';

export const RESET_TWO_FACTOR_AUTHENTICATION = gql`
  mutation deleteTwoFactorAuthenticationMethod(
    $twoFactorAuthenticationMethodId: String!
  ) {
    deleteTwoFactorAuthenticationMethod(
      twoFactorAuthenticationMethodId: $twoFactorAuthenticationMethodId
    ) {
      success
    }
  }
`;
