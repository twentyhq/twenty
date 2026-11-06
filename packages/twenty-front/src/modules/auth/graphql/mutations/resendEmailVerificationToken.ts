import { gql } from '@apollo/client';

export const RESEND_EMAIL_VERIFICATION_TOKEN = gql`
  mutation ResendEmailVerificationToken(
    $email: String!
    $origin: String!
    $partner: String
  ) {
    resendEmailVerificationToken(
      email: $email
      origin: $origin
      partner: $partner
    ) {
      success
    }
  }
`;
