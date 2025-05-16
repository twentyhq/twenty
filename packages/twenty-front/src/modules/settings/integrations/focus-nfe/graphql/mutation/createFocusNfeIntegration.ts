import { gql } from '@apollo/client';

export const CREATE_FOCUS_NFE_INTEGRATION = gql`
  mutation CreateFocusNfeIntegration(
    $createInput: CreateFocusNfeIntegrationInput!
  ) {
    createFocusNfeIntegration(createInput: $createInput) {
      id
      integrationName
      status
      workspace {
        id
      }
    }
  }
`;
