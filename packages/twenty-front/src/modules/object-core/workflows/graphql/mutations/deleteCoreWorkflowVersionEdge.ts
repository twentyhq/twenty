import { WORKFLOW_DIFF_FRAGMENT } from '@/workflow/graphql/fragments/workflowDiffFragment';
import { gql } from '@apollo/client';

export const DELETE_CORE_WORKFLOW_VERSION_EDGE = gql`
  mutation DeleteCoreWorkflowVersionEdge(
    $input: DeleteCoreWorkflowVersionEdgeInput!
  ) {
    deleteWorkflowVersionEdge: deleteCoreWorkflowVersionEdge(input: $input) {
      ...WorkflowDiffFragment
    }
  }

  ${WORKFLOW_DIFF_FRAGMENT}
`;
