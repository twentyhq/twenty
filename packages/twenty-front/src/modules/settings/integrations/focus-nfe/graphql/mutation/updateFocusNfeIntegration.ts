import { gql } from '@apollo/client';

export const UPDATE_FOCUS_NFE_INTEGRATION = gql`
  mutation UpdateFocusNfeIntegration(
    $updateInput: UpdateFocusNfeIntegrationInput!
  ) {
    updateFocusNfeIntegration(updateInput: $updateInput) {
      id
      integrationName
      status
      createdAt
      updatedAt
      workspace {
        displayName
        id
      }
    }
  }
`;
