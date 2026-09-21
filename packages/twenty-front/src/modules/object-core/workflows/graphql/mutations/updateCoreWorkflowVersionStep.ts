import { gql } from '@apollo/client';

export const UPDATE_CORE_WORKFLOW_VERSION_STEP = gql`
  mutation UpdateCoreWorkflowVersionStep(
    $input: UpdateCoreWorkflowVersionStepInput!
  ) {
    updateWorkflowVersionStep: updateCoreWorkflowVersionStep(input: $input) {
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
