import { gql } from '@apollo/client';

export const DELETE_WORKFLOW_VERSION_STEP = gql`
  mutation DeleteWorkflowVersionStep($input: DeleteWorkflowVersionStepInput!) {
    deleteWorkflowVersionStep(input: $input) {
      triggerNextStepIds
      stepsNextStepIds
      deletedStepId
    }
  }
`;
