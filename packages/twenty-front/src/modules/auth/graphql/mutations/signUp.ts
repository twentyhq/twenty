import { gql } from '@apollo/client';

export const SIGN_UP = gql`
  mutation SignUp(
    $email: String!
    $password: String!
    $captchaToken: String
    $locale: String
    $verifyEmailNextPath: String
  ) {
    signUp(
      email: $email
      password: $password
      captchaToken: $captchaToken
      locale: $locale
      verifyEmailNextPath: $verifyEmailNextPath
    ) {
      availableWorkspaces {
        ...AvailableWorkspacesFragment
      }
      tokens {
        ...AuthTokensFragment
      }
    }
  }
`;
