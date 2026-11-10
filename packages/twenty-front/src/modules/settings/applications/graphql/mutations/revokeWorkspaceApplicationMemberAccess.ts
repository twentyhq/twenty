import { gql } from '@apollo/client';

export const REVOKE_WORKSPACE_APPLICATION_MEMBER_ACCESS = gql`
  mutation RevokeWorkspaceApplicationMemberAccess(
    $applicationId: UUID!
    $userId: UUID!
  ) {
    revokeWorkspaceApplicationMemberAccess(
      applicationId: $applicationId
      userId: $userId
    )
  }
`;
