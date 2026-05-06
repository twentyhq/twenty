import { gql } from '@apollo/client';

export const REFRESH_UPGRADE_STATUS = gql`
  mutation RefreshUpgradeStatus {
    refreshUpgradeStatus {
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
