import gql from 'graphql-tag';

export const FIND_INSTALL_APPLICATION_JOB_STATUS = gql`
  query FindInstallApplicationJobStatus(
    $universalIdentifier: String!
    $jobId: String
  ) {
    findInstallApplicationJobStatus(
      universalIdentifier: $universalIdentifier
      jobId: $jobId
    ) {
      jobId
      state
      failedReason
    }
  }
`;
