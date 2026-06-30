import { gql } from '@apollo/client';

export const SIGN_UP = gql`
  mutation SignUp(
    $email: String!
    $password: String!
    $captchaToken: String
    $locale: String
    $verifyEmailRedirectPath: String
  ) {
    signUp(
      email: $email
      password: $password
      captchaToken: $captchaToken
      locale: $locale
      verifyEmailRedirectPath: $verifyEmailRedirectPath
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
