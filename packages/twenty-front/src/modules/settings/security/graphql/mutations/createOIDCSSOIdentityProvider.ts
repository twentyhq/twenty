/* @license Enterprise */

import { gql } from '@apollo/client';

export const CREATE_Oidc_Sso_IDENTITY_PROVIDER = gql`
  mutation CreateOidcIdentityProvider($input: SetupOidcSsoInput!) {
    createOidcIdentityProvider(input: $input) {
      id
      type
      issuer
      name
      status
    }
  }
`;
