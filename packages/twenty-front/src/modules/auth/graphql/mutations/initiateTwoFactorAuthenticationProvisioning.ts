import { gql } from '@apollo/client';

export const INITIATE_TWO_FACTOR_AUTHENTICATION_PROVISIONING = gql`
  mutation InitiateTwoFactorAuthenticationProvisioning(
    $loginToken: String!
    $captchaToken: String
    $origin: String!
  ) {
    initiateTwoFactorAuthenticationProvisioning(
      loginToken: $loginToken
      captchaToken: $captchaToken
      origin: $origin
    ) {
      uri
    }
  }
`;
