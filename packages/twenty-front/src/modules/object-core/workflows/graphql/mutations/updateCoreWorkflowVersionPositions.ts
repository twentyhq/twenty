import { gql } from '@apollo/client';

export const UPDATE_CORE_WORKFLOW_VERSION_POSITIONS = gql`
  mutation UpdateCoreWorkflowVersionPositions(
    $input: UpdateCoreWorkflowVersionPositionsInput!
  ) {
    updateWorkflowVersionPositions: updateCoreWorkflowVersionPositions(
      input: $input
    )
  }
`;
