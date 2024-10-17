/* @license Enterprise */

import { gql } from '@apollo/client';

export const LIST_WORKSPACE_SSO_IDENTITY_PROVIDERS = gql`
  query ListSSOIdentityProvidersByWorkspaceId {
    listSSOIdentityProvidersByWorkspaceId {
      type
      id
      name
      issuer
      status
    }
  }
`;
