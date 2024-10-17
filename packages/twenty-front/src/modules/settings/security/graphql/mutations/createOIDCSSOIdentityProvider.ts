/* @license Enterprise */

import { gql } from '@apollo/client';

export const CREATE_OIDC_SSO_IDENTITY_PROVIDER = gql`
  mutation CreateOIDCIdentityProvider($input: SetupOIDCSsoInput!) {
    createOIDCIdentityProvider(input: $input) {
      id
      type
      issuer
      name
      status
    }
  }
`;
