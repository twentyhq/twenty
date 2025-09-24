import { WORKFLOW_DIFF_FRAGMENT } from '@/workflow/graphql/fragments/workflowDiffFragment';
import { gql } from '@apollo/client';

export const DELETE_WORKFLOW_VERSION_STEP = gql`
  mutation DeleteWorkflowVersionStep($input: DeleteWorkflowVersionStepInput!) {
    deleteWorkflowVersionStep(input: $input) {
      ...WorkflowDiffFragment
    }
  }

  ${WORKFLOW_DIFF_FRAGMENT}
`;
