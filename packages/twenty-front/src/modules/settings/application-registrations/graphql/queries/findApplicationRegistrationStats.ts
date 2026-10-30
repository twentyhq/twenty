import { gql } from '@apollo/client';

export const FIND_APPLICATION_REGISTRATION_STATS = gql`
  query FindApplicationRegistrationStats(
    $id: String!
    $periodStart: DateTime!
    $periodEnd: DateTime!
  ) {
    findApplicationRegistrationStats(
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

export const FIND_APPLICATION_REGISTRATION_INSTALL_COUNT = gql`
  query FindApplicationRegistrationInstallCount($id: String!) {
    findApplicationRegistrationStats(id: $id) {
      activeInstalls
    }
  }
`;
