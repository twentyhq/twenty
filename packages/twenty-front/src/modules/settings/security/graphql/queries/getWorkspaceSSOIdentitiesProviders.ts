/* @license Enterprise */

import { gql } from '@apollo/client';

export const GET_Sso_IDENTITY_PROVIDERS = gql`
  query GetSsoIdentityProviders {
    getSsoIdentityProviders {
      type
      id
      name
      issuer
      status
    }
  }
`;
