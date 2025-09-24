import { WORKFLOW_DIFF_FRAGMENT } from '@/workflow/graphql/fragments/workflowDiffFragment';
import { gql } from '@apollo/client';

export const CREATE_WORKFLOW_VERSION_STEP = gql`
  mutation CreateWorkflowVersionStep($input: CreateWorkflowVersionStepInput!) {
    createWorkflowVersionStep(input: $input) {
      ...WorkflowDiffFragment
    }
  }

  ${WORKFLOW_DIFF_FRAGMENT}
`;
