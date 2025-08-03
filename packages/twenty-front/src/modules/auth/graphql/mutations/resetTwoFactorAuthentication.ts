import { gql } from '@apollo/client';

export const DELETE_TWO_FACTOR_AUTHENTICATION_METHOD = gql`
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
