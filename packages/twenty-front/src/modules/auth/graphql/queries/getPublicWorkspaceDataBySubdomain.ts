import { gql } from '@apollo/client';

export const GET_PUBLIC_WORKSPACE_DATA_BY_SUBDOMAIN = gql`
  query GetPublicWorkspaceDataBySubdomain($workspaceId: String) {
    getPublicWorkspaceDataBySubdomain(workspaceId: $workspaceId) {
      id
      logo
      displayName
      subdomain
      authProviders {
        sso {
          id
          name
          type
          status
          issuer
        }
        google
        magicLink
        password
        microsoft
      }
    }
  }
`;
