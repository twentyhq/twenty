import { gql } from '@apollo/client';

export const CREATE_WORKSPACE_BILLING_ARRANGEMENT = gql`
  mutation CreateWorkspaceBillingArrangement(
    $workspaceId: UUID!
    $type: BillingArrangementType!
    $label: BillingArrangementLabel!
    $comment: String
    $endsAt: DateTime
    $seats: Int
    $seatCapMode: BillingArrangementSeatCapMode
    $creditAllowance: Float
  ) {
    createWorkspaceBillingArrangement(
      workspaceId: $workspaceId
      type: $type
      label: $label
      comment: $comment
      endsAt: $endsAt
      seats: $seats
      seatCapMode: $seatCapMode
      creditAllowance: $creditAllowance
    ) {
      id
    }
  }
`;
