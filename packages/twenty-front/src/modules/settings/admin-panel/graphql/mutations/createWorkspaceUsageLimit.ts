import { gql } from '@apollo/client';

export const CREATE_WORKSPACE_USAGE_LIMIT = gql`
  mutation CreateWorkspaceUsageLimit(
    $workspaceId: UUID!
    $payload: CreateUsageLimitInput!
  ) {
    createWorkspaceUsageLimit(workspaceId: $workspaceId, payload: $payload) {
      id
    }
  }
`;
