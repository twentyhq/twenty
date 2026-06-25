import { gql } from '@apollo/client';

export const FIND_APPLICATION_CONNECTION_PROVIDERS = gql`
  query ApplicationConnectionProviders($applicationId: UUID!) {
    applicationConnectionProviders(applicationId: $applicationId) {
      id
      applicationId
      type
      name
      displayName
      oauth {
        scopes
        isClientCredentialsConfigured
      }
    }
  }
`;
