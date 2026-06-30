/* @license Enterprise */

import { gql } from '@apollo/client';

export const GET_SSO_IDENTITY_PROVIDERS = gql`
  query GetSSOIdentityProviders {
    getSSOIdentityProviders {
      type
      id
      name
      issuer
      status
    }
  }
`;
