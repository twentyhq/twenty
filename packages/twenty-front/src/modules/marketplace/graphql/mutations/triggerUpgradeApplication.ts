import gql from 'graphql-tag';

export const TRIGGER_UPGRADE_APPLICATION = gql`
  mutation TriggerUpgradeApplication($input: TriggerUpgradeApplicationInput!) {
    triggerUpgradeApplication(input: $input) {
      jobId
    }
  }
`;
