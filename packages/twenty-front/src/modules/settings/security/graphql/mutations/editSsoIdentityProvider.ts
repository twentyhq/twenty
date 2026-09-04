/* @license Enterprise */

import { gql } from '@apollo/client';

export const EDIT_SSO_IDENTITY_PROVIDER = gql`
  mutation EditSSOIdentityProvider($input: EditSsoInput!) {
    editSSOIdentityProvider(input: $input) {
      id
      type
      issuer
      name
      status
    }
  }
`;
