import { gql } from '@apollo/client';

export const PREPARE_GETTING_STARTED_WORKFLOW = gql`
  mutation PrepareGettingStartedWorkflow($step: GettingStartedStep!) {
    prepareGettingStartedWorkflow(step: $step) {
      workflowId
      versionId
    }
  }
`;
