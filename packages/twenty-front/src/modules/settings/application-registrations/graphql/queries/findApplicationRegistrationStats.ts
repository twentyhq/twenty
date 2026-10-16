import { gql } from '@apollo/client';

export const FIND_APPLICATION_REGISTRATION_STATS = gql`
  query FindApplicationRegistrationStats($id: String!) {
    findApplicationRegistrationStats(id: $id) {
      activeInstalls
      autoUpdateEnabled
      suspendedInstalls
      mostInstalledVersion
      versionDistribution {
        version
        count
      }
    }
  }
`;
