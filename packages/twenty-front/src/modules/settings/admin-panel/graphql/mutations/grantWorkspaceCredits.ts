import { gql } from '@apollo/client';

export const GRANT_WORKSPACE_CREDITS = gql`
  mutation GrantWorkspaceCredits(
    $workspaceId: UUID!
    $amount: Float!
    $type: BillingCreditGrantType!
    $reason: String
    $expiresInDays: Int
    $clientOperationId: UUID!
  ) {
    grantWorkspaceCredits(
      workspaceId: $workspaceId
      amount: $amount
      type: $type
      reason: $reason
      expiresInDays: $expiresInDays
      clientOperationId: $clientOperationId
    ) {
      id
      amount
      type
      effectiveAt
      expiresAt
      revokedAt
      sourceGrantId
      reason
      isActive
      createdAt
    }
  }
`;
