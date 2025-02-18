import { gql } from '@apollo/client';

export const SEND_TRUSTED_DOMAIN_VERIFICATION_EMAIL = gql`
  mutation SendTrustedDomainVerificationEmail(
    $input: SendTrustedDomainVerificationEmailInput!
  ) {
    sendTrustedDomainVerificationEmail(input: $input)
  }
`;
