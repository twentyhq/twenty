import { gql } from '@apollo/client';

export const DELETE_WORKFLOW_VERSION_EDGE = gql`
  mutation DeleteWorkflowVersionEdge($input: CreateWorkflowVersionEdgeInput!) {
    deleteWorkflowVersionEdge(input: $input) {
      triggerNextStepIds
      stepsNextStepIds
    }
  }
`;
