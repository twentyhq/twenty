import { gql } from '@apollo/client';

export const PREPARE_GETTING_STARTED_WORKFLOW = gql`
  mutation PrepareGettingStartedWorkflow($activate: Boolean!) {
    prepareGettingStartedWorkflow(activate: $activate) {
      workflowId
      versionId
    }
  }
`;
