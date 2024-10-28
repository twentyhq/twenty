/* @license Enterprise */

import { gql } from '@apollo/client';

export const AVAILABLE_SSO_IDENTITY_PROVIDERS_FRAGMENT = gql`
  fragment AvailableSSOIdentityProvidersFragment on FindAvailableSSOIDPOutput {
    id
    issuer
    name
    status
    workspace {
      id
      displayName
    }
  }
`;
