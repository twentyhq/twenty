import { gql } from '@apollo/client';

export const UPDATE_WHATSAPP_INTEGRATION = gql`
  mutation UpdateWhatsappIntegration(
    $updateInput: UpdateWhatsappIntegrationInput!
  ) {
    updateWhatsappIntegration(updateInput: $updateInput) {
      id
      name
      phoneId
      businessAccountId
      accessToken
      appId
      appKey
    }
  }
`;
