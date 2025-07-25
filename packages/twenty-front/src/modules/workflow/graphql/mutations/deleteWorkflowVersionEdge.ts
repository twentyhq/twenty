import { gql } from '@apollo/client';

export const DELETE_WORKFLOW_VERSION_EDGE = gql`
  mutation DeleteWorkflowVersionEdge($input: WorkflowVersionEdgeInput!) {
    deleteWorkflowVersionEdge(input: $input) {
      source
      target
    }
  }
`;
