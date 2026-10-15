import { gql } from '@apollo/client';

export const FIND_APPLICATION_REGISTRATION_STATS = gql`
  query FindApplicationRegistrationStats($id: String!) {
    findApplicationRegistrationStats(id: $id) {
      activeInstalls
      suspendedInstalls
      onLatestVersion
      updatesAvailable
      autoUpdateEnabled
      workspacesNeedingAttention
      healthCheckedWorkspaces
      totalCreditsConsumed
      mostInstalledVersion
      versionDistribution {
        version
        count
      }
    }
  }
`;
