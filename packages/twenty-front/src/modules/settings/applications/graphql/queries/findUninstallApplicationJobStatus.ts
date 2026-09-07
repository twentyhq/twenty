import gql from 'graphql-tag';

export const FIND_UNINSTALL_APPLICATION_JOB_STATUS = gql`
  query FindUninstallApplicationJobStatus($universalIdentifier: String!) {
    findUninstallApplicationJobStatus(
      universalIdentifier: $universalIdentifier
    ) {
      jobId
      state
      failedReason
    }
  }
`;
