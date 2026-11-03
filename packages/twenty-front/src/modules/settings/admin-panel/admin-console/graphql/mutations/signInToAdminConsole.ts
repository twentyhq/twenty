import { gql } from '@apollo/client';

export const SIGN_IN_TO_ADMIN_CONSOLE = gql`
  mutation SignInToAdminConsole($loginToken: String!) {
    signInToAdminConsole(loginToken: $loginToken)
  }
`;
