/* @license Enterprise */

import { gql } from '@apollo/client';

export const AVAILABLE_Sso_IDENTITY_PROVIDERS_FRAGMENT = gql`
  fragment AvailableSsoIdentityProvidersFragment on FindAvailableSsoIDP {
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
