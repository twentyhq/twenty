import gql from 'graphql-tag';

export const FIND_INSTALL_APPLICATION_JOB_STATUS = gql`
  query FindInstallApplicationJobStatus($universalIdentifier: String!) {
    findInstallApplicationJobStatus(universalIdentifier: $universalIdentifier) {
      jobId
      state
      failedReason
    }
  }
`;
