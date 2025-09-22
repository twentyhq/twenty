import { gql } from '@apollo/client';

export const DUPLICATE_WORKFLOW_VERSION_STEP = gql`
  mutation DuplicateWorkflowVersionStep(
    $input: DuplicateWorkflowVersionStepInput!
  ) {
    duplicateWorkflowVersionStep(input: $input) {
      triggerDiff
      stepsDiff
    }
  }
`;
