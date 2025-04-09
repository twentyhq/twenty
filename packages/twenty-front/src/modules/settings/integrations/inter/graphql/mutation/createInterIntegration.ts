import { gql } from '@apollo/client';

export const CREATE_INTER_INTEGRATION = gql`
  mutation CreateInterIntegration($createInput: CreateInterIntegrationInput!) {
    createInterIntegration(createInput: $createInput) {
      id
      integrationName
      clientId
      clientSecret
      privateKey
      certificate
      status
      workspace {
        id
      }
    }
  }
`;
