import gql from 'graphql-tag';

export const FIND_UPGRADE_APPLICATION_JOB_STATUS = gql`
  query FindUpgradeApplicationJobStatus($universalIdentifier: String!) {
    findUpgradeApplicationJobStatus(universalIdentifier: $universalIdentifier) {
      jobId
      state
      failedReason
      progress
    }
  }
`;
