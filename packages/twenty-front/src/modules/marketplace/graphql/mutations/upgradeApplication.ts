import gql from 'graphql-tag';

export const UPGRADE_APPLICATION = gql`
  mutation UpgradeApplication(
    $appRegistrationId: String!
    $targetVersion: String!
    $allowDestructive: Boolean
  ) {
    upgradeApplication(
      appRegistrationId: $appRegistrationId
      targetVersion: $targetVersion
      allowDestructive: $allowDestructive
    )
  }
`;
