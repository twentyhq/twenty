import { gql } from '@apollo/client';

export const END_WORKSPACE_BILLING_ARRANGEMENT = gql`
  mutation EndWorkspaceBillingArrangement(
    $workspaceId: UUID!
    $billingArrangementId: UUID!
  ) {
    endWorkspaceBillingArrangement(
      workspaceId: $workspaceId
      billingArrangementId: $billingArrangementId
    ) {
      id
    }
  }
`;
