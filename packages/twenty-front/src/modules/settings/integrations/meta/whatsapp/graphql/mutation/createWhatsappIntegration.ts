import { gql } from '@apollo/client';

export const CREATE_WHATSAPP_INTEGRATION = gql`
  mutation CreateWhatsappIntegration(
    $createInput: CreateWhatsappIntegrationInput!
  ) {
    createWhatsappIntegration(createInput: $createInput) {
      name
      phoneId
      businessAccountId
      accessToken
      appId
      appKey
    }
  }
`;
