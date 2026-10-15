import { gql } from '@apollo/client';

export const FIND_APPLICATION_REGISTRATION_STATS = gql`
  query FindApplicationRegistrationStats($id: String!) {
    findApplicationRegistrationStats(id: $id) {
      activeInstalls
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
