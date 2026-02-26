import { gql } from '@apollo/client';

export const FIND_APPLICATION_REGISTRATION_STATS = gql`
  query FindApplicationRegistrationStats($id: String!) {
    findApplicationRegistrationStats(id: $id) {
      activeInstalls
      latestVersion
      versionDistribution {
        version
        count
      }
    }
  }
`;
