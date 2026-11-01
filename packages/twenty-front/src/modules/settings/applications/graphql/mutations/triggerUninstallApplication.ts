import gql from 'graphql-tag';

export const TRIGGER_UNINSTALL_APPLICATION = gql`
  mutation TriggerUninstallApplication(
    $input: TriggerUninstallApplicationInput!
  ) {
    triggerUninstallApplication(input: $input) {
      jobId
    }
  }
`;
