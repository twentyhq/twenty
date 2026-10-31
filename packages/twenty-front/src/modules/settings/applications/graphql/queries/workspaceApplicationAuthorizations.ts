import { gql } from '@apollo/client';

export const WORKSPACE_APPLICATION_AUTHORIZATIONS = gql`
  query WorkspaceApplicationAuthorizations($applicationId: UUID!) {
    workspaceApplicationAuthorizations(applicationId: $applicationId) {
      id
      userId
      applicationId
      scopes
      lastUsedAt
    }
  }
`;
