import { gql } from '@apollo/client';

export const FIND_ADMIN_APPLICATION_REGISTRATION_STATS = gql`
  query FindAdminApplicationRegistrationStats($id: String!) {
    findAdminApplicationRegistrationStats(id: $id) {
      activeInstalls
      suspendedInstalls
      mostInstalledVersion
      versionDistribution {
        version
        count
      }
    }
  }
`;
