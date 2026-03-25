import { gql } from '@apollo/client';

export const UPDATE_WORKFLOW_RUN_STEP = gql`
  mutation UpdateWorkflowRunStep($input: UpdateWorkflowRunStepInput!) {
    updateWorkflowRunStep(input: $input) {
      id
      name
      type
      settings
      valid
      nextStepIds
      position {
        x
        y
      }
    }
  }
`;
