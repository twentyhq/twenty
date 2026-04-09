import { WORKFLOW_DIFF_FRAGMENT } from '@/workflow/graphql/fragments/workflowDiffFragment';
import { gql } from '@apollo/client';

export const CREATE_WORKFLOW_VERSION_EDGE = gql`
  mutation CreateWorkflowVersionEdge($input: CreateWorkflowVersionEdgeInput!) {
    createWorkflowVersionEdge(input: $input) {
      ...WorkflowDiffFragment
    }
  }

  ${WORKFLOW_DIFF_FRAGMENT}
`;
