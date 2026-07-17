import { gql } from '@apollo/client';

export const UPGRADE_REGISTRATION_APPLICATIONS = gql`
  mutation UpgradeRegistrationApplications(
    $applicationRegistrationId: String!
  ) {
    upgradeRegistrationApplications(
      applicationRegistrationId: $applicationRegistrationId
    )
  }
`;
