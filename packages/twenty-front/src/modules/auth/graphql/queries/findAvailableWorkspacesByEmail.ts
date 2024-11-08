import { gql } from '@apollo/client';

export const FIND_AVAILABLE_WORKSPACES_BY_EMAIL = gql`
  query FindAvailableWorkspacesByEmail($email: String!) {
    findAvailableWorkspacesByEmail(email: $email) {
      id
      displayName
      subdomain
      logo
      sso {
        type
        id
        issuer
        name
        status
      }
    }
  }
`;
