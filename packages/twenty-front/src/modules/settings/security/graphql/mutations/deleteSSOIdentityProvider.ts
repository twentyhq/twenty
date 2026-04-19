/* @license Enterprise */

import { gql } from '@apollo/client';

export const DELETE_Sso_IDENTITY_PROVIDER = gql`
  mutation DeleteSsoIdentityProvider($input: DeleteSsoInput!) {
    deleteSsoIdentityProvider(input: $input) {
      identityProviderId
    }
  }
`;
