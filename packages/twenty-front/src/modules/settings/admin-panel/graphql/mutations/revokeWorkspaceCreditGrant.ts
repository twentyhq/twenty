import { gql } from '@apollo/client';

export const REVOKE_WORKSPACE_CREDIT_GRANT = gql`
  mutation RevokeWorkspaceCreditGrant(
    $workspaceId: UUID!
    $creditGrantId: UUID!
  ) {
    revokeWorkspaceCreditGrant(
      workspaceId: $workspaceId
      creditGrantId: $creditGrantId
    ) {
      id
      amount
      type
      effectiveAt
      expiresAt
      revokedAt
      reason
      isActive
      createdAt
    }
  }
`;
