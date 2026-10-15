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
        agent
        logic
        workflow
        chargeCredits
        other
      }
      mostInstalledVersion
      versionDistribution {
        version
        count
      }
    }
  }
`;
