import { gql } from '@apollo/client';

export const INITIATE_OTP_PROVISIONING = gql`
  mutation initiateOTPProvisioning(
    $loginToken: String!
    $captchaToken: String
    $origin: String!
  ) {
    initiateOTPProvisioning(
      loginToken: $loginToken
      captchaToken: $captchaToken
      origin: $origin
    ) {
      uri
    }
  }
`;