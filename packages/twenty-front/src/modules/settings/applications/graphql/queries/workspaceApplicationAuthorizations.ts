import { gql } from '@apollo/client';

export const WORKSPACE_APPLICATION_AUTHORIZATIONS = gql`
  query WorkspaceApplicationAuthorizations {
    workspaceApplicationAuthorizations {
      id
      applicationId
      applicationName
      userId
      lastUsedAt
    }
  }
`;
