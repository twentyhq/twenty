import { gql } from '@apollo/client';

export const UPDATE_DRAFT_WORKFLOW_VERSION_POSITIONS = gql`
  mutation UpdateDraftWorkflowVersionPositions(
    $input: UpdateDraftWorkflowVersionPositionsInput!
  ) {
    updateDraftWorkflowVersionPositions(input: $input)
  }
`;
