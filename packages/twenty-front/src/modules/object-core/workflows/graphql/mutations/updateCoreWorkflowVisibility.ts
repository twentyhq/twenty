import { gql } from '@apollo/client';

export const UPDATE_CORE_WORKFLOW_VISIBILITY = gql`
  mutation UpdateCoreWorkflowVisibility(
    $input: UpdateCoreWorkflowVisibilityInput!
  ) {
    updateCoreWorkflowVisibility(input: $input) {
      id
      visibility
      canChangeVisibility
      updatedAt
    }
  }
`;
