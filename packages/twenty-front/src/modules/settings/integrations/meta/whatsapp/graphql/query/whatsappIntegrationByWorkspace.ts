import { gql } from '@apollo/client';

export const GET_ALL_WHATSAPP_INTEGRATIONS = gql`
  query WhatsappIntegrationsByWorkspace($workspaceId: String!) {
    whatsappIntegrationsByWorkspace(workspaceId: $workspaceId) {
      id
      label
      phoneId
      businessAccountId
      appId
      appKey
      disabled
      sla
      workspace {
        id
      }
    }
  }
`;
