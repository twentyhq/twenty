import { WORKFLOW_DIFF_FRAGMENT } from '@/workflow/graphql/fragments/workflowDiffFragment';
import { gql } from '@apollo/client';

export const DUPLICATE_CORE_WORKFLOW_VERSION_STEP = gql`
  mutation DuplicateCoreWorkflowVersionStep(
    $input: DuplicateCoreWorkflowVersionStepInput!
  ) {
    duplicateWorkflowVersionStep: duplicateCoreWorkflowVersionStep(
      input: $input
    ) {
      ...WorkflowDiffFragment
    }
  }

  ${WORKFLOW_DIFF_FRAGMENT}
`;
