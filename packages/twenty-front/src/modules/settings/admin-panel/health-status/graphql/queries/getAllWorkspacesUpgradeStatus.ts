import { gql } from '@apollo/client';

export const GET_ALL_WORKSPACES_UPGRADE_STATUS = gql`
  query GetAllWorkspacesUpgradeStatus {
    getAllWorkspacesUpgradeStatus {
      instanceUpgradeStatus {
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
      totalCount
      upToDateCount
      behindCount
      failedCount
      workspacesBehindIds
      workspacesFailedIds
      computedAt
    }
  }
`;
