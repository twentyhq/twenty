/* @license Enterprise */

import { gql } from '@apollo/client';

export const CREATE_Saml_Sso_IDENTITY_PROVIDER = gql`
  mutation CreateSamlIdentityProvider($input: SetupSamlSsoInput!) {
    createSamlIdentityProvider(input: $input) {
      id
      type
      issuer
      name
      status
    }
  }
`;
