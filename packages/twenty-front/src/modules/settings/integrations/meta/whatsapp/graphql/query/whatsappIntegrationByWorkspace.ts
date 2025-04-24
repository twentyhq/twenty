import { gql } from '@apollo/client';

export const GET_ALL_WHATSAPP_INTEGRATIONS = gql`
  query WhatsappIntegrationsByWorkspace {
    whatsappIntegrationsByWorkspace {
      id
      name
      phoneId
      businessAccountId
      appId
      appKey
      disabled
      sla
    }
  }
`;
