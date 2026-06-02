import { gql } from '@apollo/client';

export const GET_UPGRADE_STATUS = gql`
  query GetUpgradeStatus($workspaceIds: [UUID!]!) {
    getUpgradeStatus(workspaceIds: $workspaceIds) {
      workspaceId
      displayName
      inferredVersion
      health
      latestCommand {
        name
        status
        executedByVersion
        errorMessage
        createdAt
      }
    }
  }
`;
