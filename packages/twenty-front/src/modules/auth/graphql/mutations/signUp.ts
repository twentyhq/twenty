import { gql } from '@apollo/client';

export const SIGN_UP = gql`
  mutation SignUp(
    $email: String!
    $password: String!
    $captchaToken: String
    $locale: String
    $verifyEmailRedirectPath: String
    $partnerName: String
  ) {
    signUp(
      email: $email
      password: $password
      captchaToken: $captchaToken
      locale: $locale
      verifyEmailRedirectPath: $verifyEmailRedirectPath
      partnerName: $partnerName
    ) {
      availableWorkspaces {
        ...AvailableWorkspacesFragment
      }
      tokens {
        ...AuthTokenPairFragment
      }
    }
  }
`;
