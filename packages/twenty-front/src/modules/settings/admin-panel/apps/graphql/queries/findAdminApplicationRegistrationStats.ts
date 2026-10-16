import { gql } from '@apollo/client';

export const FIND_ADMIN_APPLICATION_REGISTRATION_STATS = gql`
  query FindAdminApplicationRegistrationStats($id: String!) {
    findAdminApplicationRegistrationStats(id: $id) {
      activeInstalls
      onLatestVersion
      updatesAvailable
      healthCheckedWorkspaces
      suspendedInstalls
      autoUpdateEnabled
      workspacesNeedingAttention
      totalCreditsConsumed
      creditBreakdown {
        key
        label
        operationType
        isAppDefined
        creditsConsumed
      }
      mostInstalledVersion
      versionDistribution {
        version
        count
      }
    }
  }
`;
