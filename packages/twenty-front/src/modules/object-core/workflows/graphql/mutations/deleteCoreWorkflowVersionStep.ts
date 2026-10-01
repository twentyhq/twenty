import { WORKFLOW_DIFF_FRAGMENT } from '@/workflow/graphql/fragments/workflowDiffFragment';
import { gql } from '@apollo/client';

export const DELETE_CORE_WORKFLOW_VERSION_STEP = gql`
  mutation DeleteCoreWorkflowVersionStep(
    $input: DeleteCoreWorkflowVersionStepInput!
  ) {
    deleteWorkflowVersionStep: deleteCoreWorkflowVersionStep(input: $input) {
      ...WorkflowDiffFragment
    }
  }

  ${WORKFLOW_DIFF_FRAGMENT}
`;
