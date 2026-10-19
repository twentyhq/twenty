import { gql } from '@apollo/client';

export const FIND_ADMIN_APPLICATION_REGISTRATION_STATS = gql`
  query FindAdminApplicationRegistrationStats(
    $id: String!
    $periodStart: DateTime!
    $periodEnd: DateTime!
  ) {
    findAdminApplicationRegistrationStats(
      id: $id
      periodStart: $periodStart
      periodEnd: $periodEnd
    ) {
      activeInstalls
      autoUpdateEnabled
      totalCreditsUsed
      creditsUsedBreakdown {
        label
        operation
        creditsUsed
      }
      suspendedInstalls
      mostInstalledVersion
      versionDistribution {
        version
        count
      }
    }
  }
`;
