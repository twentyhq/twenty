import { gql } from '@apollo/client';

export const GET_AUTH_TOKENS_FROM_OTP = gql`
  mutation getAuthTokensFromOTP(
    $loginToken: String!
    $otp: String!
    $captchaToken: String
    $origin: String!
  ) {
    getAuthTokensFromOTP(
      loginToken: $loginToken
      otp: $otp
      captchaToken: $captchaToken
      origin: $origin
    ) {
      tokens {
        ...AuthTokenPairFragment
      }
    }
  }
`;
