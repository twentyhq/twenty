/* @license Enterprise */

import { gql } from '@apollo/client';

export const FIND_AVAILABLE_SSO_IDENTITY_PROVIDERS = gql`
  mutation FindAvailableSSOIdentityProviders(
    $input: FindAvailableSSOIDPInput!
  ) {
    findAvailableSSOIdentityProviders(input: $input) {
      ...AvailableSSOIdentityProvidersFragment
    }
  }
`;
