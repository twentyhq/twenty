import { gql } from '@apollo/client';

export const GRANT_WORKSPACE_CREDITS = gql`
  mutation GrantWorkspaceCredits(
    $workspaceId: UUID!
    $amount: Float!
    $type: BillingCreditGrantType!
    $reason: String
  ) {
    grantWorkspaceCredits(
      workspaceId: $workspaceId
      amount: $amount
      type: $type
      reason: $reason
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
