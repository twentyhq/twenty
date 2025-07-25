import { gql } from '@apollo/client';

export const CREATE_WORKFLOW_VERSION_EDGE = gql`
  mutation CreateWorkflowVersionEdge($input: WorkflowVersionEdgeInput!) {
    createWorkflowVersionEdge(input: $input) {
      source
      target
    }
  }
`;
