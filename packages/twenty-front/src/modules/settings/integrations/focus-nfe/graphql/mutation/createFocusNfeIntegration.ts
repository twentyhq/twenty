import { gql } from '@apollo/client';

export const CREATE_FOCUS_NFE_INTEGRATION = gql`
  mutation CreateFocusNfeIntegration(
    $createInput: CreateFocusNfeIntegrationInput!
  ) {
    createInterIntegration(createInput: $createInput) {
      id
      integrationName
      token
      status
      workspace {
        id
      }
    }
  }
`;
