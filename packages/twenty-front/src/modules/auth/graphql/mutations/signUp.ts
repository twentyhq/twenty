import { gql } from '@apollo/client';

export const SIGN_UP = gql`
  mutation SignUp($email: String!, $password: String!, $captchaToken: String) {
    signUp(email: $email, password: $password, captchaToken: $captchaToken) {
      availableWorkspaces {
        ...AvailableWorkspacesFragment
      }
      tokens {
        ...AuthTokensFragment
      }
    }
  }
`;
