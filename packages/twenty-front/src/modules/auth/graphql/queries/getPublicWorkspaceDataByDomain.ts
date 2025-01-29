import { gql } from '@apollo/client';

export const GET_PUBLIC_WORKSPACE_DATA_BY_DOMAIN = gql`
  query GetPublicWorkspaceDataByDomain {
    getPublicWorkspaceDataByDomain {
      id
      logo
      displayName
      workspaceUrl
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
