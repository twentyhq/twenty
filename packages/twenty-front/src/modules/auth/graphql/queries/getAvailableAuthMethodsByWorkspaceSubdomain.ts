import { gql } from '@apollo/client';

export const GET_AVAILABLE_AUTH_METHODS_BY_WORKSPACE_SUBDOMAIN = gql`
  query GetAvailableAuthMethodsByWorkspaceSubdomain {
    getAvailableAuthMethodsByWorkspaceSubdomain {
      id
      authProviders {
        sso
        google
        magicLink
        password
        microsoft
      }
    }
  }
`;
