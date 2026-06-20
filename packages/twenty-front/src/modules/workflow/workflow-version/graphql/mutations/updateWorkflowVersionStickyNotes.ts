import { gql } from '@apollo/client';

export const UPDATE_WORKFLOW_VERSION_STICKY_NOTES = gql`
  mutation UpdateWorkflowVersionStickyNotes(
    $input: UpdateWorkflowVersionStickyNotesInput!
  ) {
    updateWorkflowVersionStickyNotes(input: $input)
  }
`;
