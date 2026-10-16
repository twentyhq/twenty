import { gql } from '@apollo/client';

export const FIND_ADMIN_APPLICATION_REGISTRATION_STATS = gql`
  query FindAdminApplicationRegistrationStats($id: String!) {
    findAdminApplicationRegistrationStats(id: $id) {
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
