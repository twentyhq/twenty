import { gql } from '@apollo/client';

export const GET_WORKSPACE_AGNOSTIC_TOKEN_FROM_EMAIL_VERIFICATION_TOKEN = gql`
  mutation GetWorkspaceAgnosticTokenFromEmailVerificationToken(
    $emailVerificationToken: String!
    $email: String!
    $captchaToken: String
  ) {
    getWorkspaceAgnosticTokenFromEmailVerificationToken(
      emailVerificationToken: $emailVerificationToken
      email: $email
      captchaToken: $captchaToken
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
