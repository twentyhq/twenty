import { gql } from '@apollo/client';

export const PREPARE_GETTING_STARTED_WORKFLOW = gql`
  mutation PrepareGettingStartedWorkflow(
    $stepActionKey: GettingStartedStepActionKey!
  ) {
    prepareGettingStartedWorkflow(stepActionKey: $stepActionKey) {
      workflowId
      versionId
    }
  }
`;
