import { gql } from '@apollo/client';

export const LIST_WORKSPACE_SSO_IDENTITIES_PROVIDERS = gql`
  query ListSSOIdentityProvidersByWorkspaceId {
    listSSOIdentityProvidersByWorkspaceId {
      type
      id
      name
      issuer
    }
  }
`;
