import { gql } from '@apollo/client';

export const AVAILABLE_WORKSPACES_FOR_AUTH = gql`
  query ListAvailableWorkspaces($email: String!, $captchaToken: String) {
    listAvailableWorkspaces(email: $email, captchaToken: $captchaToken) {
      ...AvailableWorkspaceForAuthFragment
    }
  }
`;
