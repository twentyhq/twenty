import gql from 'graphql-tag';

export const TRIGGER_UPGRADE_APPLICATION_JOB = gql`
  mutation TriggerUpgradeApplicationJob(
    $input: TriggerUpgradeApplicationJobInput!
  ) {
    triggerUpgradeApplicationJob(input: $input) {
      jobId
    }
  }
`;
