import { gql } from '@apollo/client';

export const GRANT_WORKSPACE_CREDITS = gql`
  mutation GrantWorkspaceCredits(
    $workspaceId: UUID!
    $amount: Float!
    $type: BillingCreditGrantType!
    $reason: String
    $clientOperationId: UUID!
  ) {
    grantWorkspaceCredits(
      workspaceId: $workspaceId
      amount: $amount
      type: $type
      reason: $reason
      clientOperationId: $clientOperationId
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
