import { gql } from '@apollo/client';

export const CREATE_WORKSPACE_USAGE_LIMIT = gql`
  mutation CreateWorkspaceUsageLimit(
    $workspaceId: UUID!
    $payload: CreateUsageLimitInput!
    $endsAt: DateTime
    $label: BillingArrangementLabel
    $comment: String
  ) {
    createWorkspaceUsageLimit(
      workspaceId: $workspaceId
      payload: $payload
      endsAt: $endsAt
      label: $label
      comment: $comment
    ) {
      id
    }
  }
`;
