import { gql } from '@apollo/client';

export const UPDATE_WORKFLOW_VERSION_POSITIONS = gql`
  mutation UpdateWorkflowVersionPositions(
    $input: UpdateWorkflowVersionPositionsInput!
  ) {
    updateWorkflowVersionPositions(input: $input)
  }
`;
