import { gql } from '@apollo/client';

export const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!, $captchaToken: String) {
    signIn(email: $email, password: $password, captchaToken: $captchaToken) {
      availableWorkspaces {
        ...AvailableWorkspacesFragment
      }
      tokens {
        ...AuthTokenPairFragment
      }
    }
  }
`;
