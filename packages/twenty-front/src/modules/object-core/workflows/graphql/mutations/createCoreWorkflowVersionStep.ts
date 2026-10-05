import { WORKFLOW_DIFF_FRAGMENT } from '@/workflow/graphql/fragments/workflowDiffFragment';
import { gql } from '@apollo/client';

export const CREATE_CORE_WORKFLOW_VERSION_STEP = gql`
  mutation CreateCoreWorkflowVersionStep(
    $input: CreateCoreWorkflowVersionStepInput!
  ) {
    createWorkflowVersionStep: createCoreWorkflowVersionStep(input: $input) {
      ...WorkflowDiffFragment
    }
  }

  ${WORKFLOW_DIFF_FRAGMENT}
`;
