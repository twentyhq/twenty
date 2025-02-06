import { gql } from '@apollo/client';

export const TOGGLE_WHATSAPP_INTEGRATION_STATUS = gql`
  mutation ToggleWhatsappIntegrationStatus($integrationId: String!) {
    toggleWhatsappIntegrationStatus(integrationId: $integrationId)
  }
`;
