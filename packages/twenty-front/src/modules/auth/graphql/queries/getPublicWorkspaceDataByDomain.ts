import { gql } from '@apollo/client';

export const GET_PUBLIC_WORKSPACE_DATA_BY_DOMAIN = gql`
  query GetPublicWorkspaceDataByDomain($origin: String!) {
    getPublicWorkspaceDataByDomain(origin: $origin) {
      id
      logo
      displayName
      workspaceUrls {
        subdomainUrl
        customUrl
      }
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
