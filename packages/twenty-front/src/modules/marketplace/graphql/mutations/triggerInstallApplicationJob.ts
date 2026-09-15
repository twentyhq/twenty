import gql from 'graphql-tag';

export const TRIGGER_INSTALL_APPLICATION_JOB = gql`
  mutation TriggerInstallApplicationJob(
    $input: TriggerInstallApplicationJobInput!
  ) {
    triggerInstallApplicationJob(input: $input) {
      jobId
    }
  }
`;
