import gql from 'graphql-tag';

export const FIND_UPGRADE_APPLICATION_JOB_STATUS = gql`
  query FindUpgradeApplicationJobStatus(
    $universalIdentifier: String!
    $jobId: String
  ) {
    findUpgradeApplicationJobStatus(
      universalIdentifier: $universalIdentifier
      jobId: $jobId
    ) {
      jobId
      state
      failedReason
      progress
    }
  }
`;
