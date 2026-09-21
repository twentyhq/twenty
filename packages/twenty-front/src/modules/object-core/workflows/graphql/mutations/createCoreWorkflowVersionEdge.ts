import { WORKFLOW_DIFF_FRAGMENT } from '@/workflow/graphql/fragments/workflowDiffFragment';
import { gql } from '@apollo/client';

export const CREATE_CORE_WORKFLOW_VERSION_EDGE = gql`
  mutation CreateCoreWorkflowVersionEdge(
    $input: CreateCoreWorkflowVersionEdgeInput!
  ) {
    createWorkflowVersionEdge: createCoreWorkflowVersionEdge(input: $input) {
      ...WorkflowDiffFragment
    }
  }

  ${WORKFLOW_DIFF_FRAGMENT}
`;
