import { gql } from '@apollo/client';

export const UPDATE_INTER_INTEGRATION = gql`
  mutation UpdateInterIntegration($updateInput: UpdateInterIntegrationInput!) {
    updateWhatsappIntegration(updateInput: $updateInput) {
      id
      integrationName
      clientId
      clientSecret
      privateKey
      certificate
      status
      expirationDate
    }
  }
`;
