/* @license Enterprise */

import { gql } from '@apollo/client';

export const CREATE_SAML_SSO_IDENTITY_PROVIDER = gql`
  mutation CreateSAMLIdentityProvider($input: SetupSAMLSsoInput!) {
    createSAMLIdentityProvider(input: $input) {
      id
      type
      issuer
      name
      status
    }
  }
`;
