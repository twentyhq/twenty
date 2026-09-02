import gql from 'graphql-tag';

export const UPGRADE_APPLICATION_ASYNC = gql`
  mutation UpgradeApplicationAsync(
    $appRegistrationId: String!
    $targetVersion: String!
  ) {
    upgradeApplicationAsync(
      appRegistrationId: $appRegistrationId
      targetVersion: $targetVersion
    ) {
      id
      name
      universalIdentifier
      version
      state
    }
  }
`;
