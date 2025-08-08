import { gql } from '@apollo/client';

export const CREATE_WORKFLOW_VERSION_STEP = gql`
  mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
    createWorkflowVersionStep(input: $input) {
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
