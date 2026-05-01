import { gql } from '@apollo/client';

export const RESEND_EMAIL_VERIFICATION_TOKEN = gql`
  mutation ResendEmailVerificationToken($email: String!, $origin: String!, $verificationTrigger: EmailVerificationTrigger) {
    resendEmailVerificationToken(email: $email, origin: $origin, verificationTrigger: $verificationTrigger) {
      success
    }
  }
`;
