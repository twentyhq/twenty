/* @license Enterprise */

import { gql } from '@apollo/client';

export const EDIT_Sso_IDENTITY_PROVIDER = gql`
  mutation EditSsoIdentityProvider($input: EditSsoInput!) {
    editSsoIdentityProvider(input: $input) {
      id
      type
      issuer
      name
      status
    }
  }
`;
