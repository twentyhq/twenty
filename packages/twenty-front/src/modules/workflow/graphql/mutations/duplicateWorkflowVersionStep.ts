import { WORKFLOW_DIFF_FRAGMENT } from '@/workflow/graphql/fragments/workflowDiffFragment';
import { gql } from '@apollo/client';

export const DUPLICATE_WORKFLOW_VERSION_STEP = gql`
  mutation DuplicateWorkflowVersionStep(
    $input: DuplicateWorkflowVersionStepInput!
  ) {
    duplicateWorkflowVersionStep(input: $input) {
      ...WorkflowDiffFragment
    }
  }

  ${WORKFLOW_DIFF_FRAGMENT}
`;
