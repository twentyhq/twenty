/* @license Enterprise */

import { gql } from '@apollo/client';

export const DELETE_SSO_IDENTITY_PROVIDER = gql`
  mutation DeleteSSOIdentityProvider($input: DeleteSsoInput!) {
    deleteSSOIdentityProvider(input: $input) {
      identityProviderId
    }
  }
`;
