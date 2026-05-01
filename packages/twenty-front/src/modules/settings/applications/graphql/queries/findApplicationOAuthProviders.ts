import { gql } from '@apollo/client';

export const FIND_APPLICATION_OAUTH_PROVIDERS = gql`
  query ApplicationOAuthProviders($applicationId: UUID!) {
    applicationOAuthProviders(applicationId: $applicationId) {
      id
      applicationId
      name
      displayName
      icon
      scopes
      connectionMode
    }
  }
`;
