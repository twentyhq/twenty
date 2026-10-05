import { gql } from '@apollo/client';

export const DELETE_WORKSPACE_USAGE_LIMIT = gql`
  mutation DeleteWorkspaceUsageLimit(
    $workspaceId: UUID!
    $usageLimitId: UUID!
  ) {
    deleteWorkspaceUsageLimit(
      workspaceId: $workspaceId
      usageLimitId: $usageLimitId
    )
  }
`;
