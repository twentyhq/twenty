import { gql } from '@apollo/client';

export const GET_INSTANCE_AND_ALL_WORKSPACES_UPGRADE_STATUS = gql`
  query GetInstanceAndAllWorkspacesUpgradeStatus {
    getInstanceAndAllWorkspacesUpgradeStatus {
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
      workspacesBehind {
        id
        name
      }
      workspacesFailed {
        id
        name
      }
      computedAt
    }
  }
`;
