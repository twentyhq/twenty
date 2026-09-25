import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE_USAGE_LIMIT = gql`
  mutation UpdateWorkspaceUsageLimit(
    $workspaceId: UUID!
    $payload: UpdateUsageLimitInput!
  ) {
    updateWorkspaceUsageLimit(workspaceId: $workspaceId, payload: $payload) {
      id
    }
  }
`;
