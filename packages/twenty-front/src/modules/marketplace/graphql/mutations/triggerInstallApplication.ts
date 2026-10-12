import gql from 'graphql-tag';

export const TRIGGER_INSTALL_APPLICATION = gql`
  mutation TriggerInstallApplication($input: TriggerInstallApplicationInput!) {
    triggerInstallApplication(input: $input) {
      jobId
    }
  }
`;
