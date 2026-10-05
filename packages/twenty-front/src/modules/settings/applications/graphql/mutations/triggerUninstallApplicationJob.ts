import gql from 'graphql-tag';

export const TRIGGER_UNINSTALL_APPLICATION_JOB = gql`
  mutation TriggerUninstallApplicationJob(
    $input: TriggerUninstallApplicationJobInput!
  ) {
    triggerUninstallApplicationJob(input: $input) {
      jobId
    }
  }
`;
