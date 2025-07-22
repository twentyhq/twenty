import { gql } from '@apollo/client';

export const RESET_TWO_FACTOR_AUTHENTICATION = gql`
  mutation deleteTwoFactorAuthenticationMethod(
    $twoFactorAuthenticationMethodId: UUID!
  ) {
    deleteTwoFactorAuthenticationMethod(
      twoFactorAuthenticationMethodId: $twoFactorAuthenticationMethodId
    ) {
      success
    }
  }
`;
