import { gql } from '@apollo/client';

export const GET_AUTH_TOKENS_FROM_TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE = gql`
  mutation getAuthTokensFromTwoFactorAuthenticationRecoveryCode(
    $loginToken: String!
    $recoveryCode: String!
    $captchaToken: String
    $origin: String!
  ) {
    getAuthTokensFromTwoFactorAuthenticationRecoveryCode(
      loginToken: $loginToken
      recoveryCode: $recoveryCode
      captchaToken: $captchaToken
      origin: $origin
    ) {
      tokens {
        ...AuthTokenPairFragment
      }
      provisioningUri
    }
  }
`;
