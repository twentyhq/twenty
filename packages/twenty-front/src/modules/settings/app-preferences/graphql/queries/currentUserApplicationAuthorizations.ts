import { gql } from '@apollo/client';

export const CURRENT_USER_APPLICATION_AUTHORIZATIONS = gql`
  query CurrentUserApplicationAuthorizations {
    currentUserApplicationAuthorizations {
      id
      applicationId
      applicationName
      scopes
      redirectUriHostnames
      lastAuthorizedAt
      lastUsedAt
      createdAt
    }
  }
`;
