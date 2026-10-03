import gql from 'graphql-tag';

export const FIND_APPLICATION_UPGRADE_ROLE_GRANTS = gql`
  query FindApplicationUpgradeRoleGrants($applicationId: UUID!) {
    applicationUpgradeRoleGrants(applicationId: $applicationId) {
      type
      action
      objectUniversalIdentifier
      fieldUniversalIdentifier
      permissionFlagUniversalIdentifier
    }
  }
`;
