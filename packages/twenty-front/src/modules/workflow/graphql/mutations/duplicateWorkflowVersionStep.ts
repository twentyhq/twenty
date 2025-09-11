import { gql } from '@apollo/client';

export const DUPLICATE_WORKFLOW_VERSION_STEP = gql`
  mutation DuplicateWorkflowVersionStep(
    $input: DuplicateWorkflowVersionStepInput!
  ) {
    duplicateWorkflowVersionStep(input: $input) {
      triggerNextStepIds
      stepsNextStepIds
      createdStep {
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
  }
`;
