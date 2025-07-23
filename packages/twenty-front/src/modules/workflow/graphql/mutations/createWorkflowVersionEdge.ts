import { gql } from '@apollo/client';

export const CREATE_WORKFLOW_VERSION_EDGE = gql`
  mutation CreateWorkflowVersionEdge($input: CreateWorkflowVersionEdgeInput!) {
    createWorkflowVersionEdge(input: $input) {
      source
      target
    }
  }
`;
