import { gql } from '@apollo/client';

export const REVOKE_WORKSPACE_APPLICATION_AUTHORIZATION = gql`
  mutation RevokeWorkspaceApplicationAuthorization(
    $applicationAuthorizationId: UUID!
  ) {
    revokeWorkspaceApplicationAuthorization(
      applicationAuthorizationId: $applicationAuthorizationId
    )
  }
`;
