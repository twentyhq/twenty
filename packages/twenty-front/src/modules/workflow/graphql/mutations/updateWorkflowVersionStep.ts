import { gql } from '@apollo/client';

export const UPDATE_WORKFLOW_VERSION_STEP = gql`
  mutation UpdateWorkflowVersionStep($input: UpdateWorkflowVersionStepInput!) {
    updateWorkflowVersionStep(input: $input) {
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
