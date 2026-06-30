import gql from 'graphql-tag';

export const PLAN_APPLICATION_UPGRADE = gql`
  query PlanApplicationUpgrade(
    $appRegistrationId: String!
    $targetVersion: String!
  ) {
    planApplicationUpgrade(
      appRegistrationId: $appRegistrationId
      targetVersion: $targetVersion
    ) {
      applicationUniversalIdentifier
      currentVersion
      proposedVersion
      isEmpty
      hasDestructiveActions
      summary {
        createCount
        updateCount
        deleteCount
        breakingCount
        destructiveCount
        totalAffectedRows
      }
      actions {
        type
        metadataName
        label
        severity
        affectedRowCount
      }
    }
  }
`;
