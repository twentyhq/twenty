import { WORKFLOW_DIFF_FRAGMENT } from '@/workflow/graphql/fragments/workflowDiffFragment';
import { gql } from '@apollo/client';

export const DELETE_WORKFLOW_VERSION_EDGE = gql`
  mutation DeleteWorkflowVersionEdge($input: CreateWorkflowVersionEdgeInput!) {
    deleteWorkflowVersionEdge(input: $input) {
      ...WorkflowDiffFragment
    }
  }

  ${WORKFLOW_DIFF_FRAGMENT}
`;
