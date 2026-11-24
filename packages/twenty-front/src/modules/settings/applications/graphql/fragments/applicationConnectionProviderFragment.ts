import { gql } from '@apollo/client';

export const APPLICATION_CONNECTION_PROVIDER_FRAGMENT = gql`
  fragment ApplicationConnectionProviderFragment on ApplicationConnectionProvider {
    id
    applicationId
    type
    name
    displayName
    scope
    logoUrl
    oauth {
      scopes
      isClientCredentialsConfigured
    }
  }
`;
