import { gql } from '@apollo/client';

export const UPGRADE_REGISTRATION_APPLICATIONS = gql`
  mutation UpgradeRegistrationApplications(
    $applicationRegistrationId: String!
    $batchSize: Int
  ) {
    upgradeRegistrationApplications(
      applicationRegistrationId: $applicationRegistrationId
      batchSize: $batchSize
    )
  }
`;
