import { gql } from '@apollo/client';

export const GET_ALL_INBOXES = gql`
  query InboxesByWorkspace($workspaceId: String!) {
    inboxesByWorkspace(workspaceId: $workspaceId) {
      id
      integrationType
      workspace {
        id
        displayName
      }
      whatsappIntegrationId
      # messengerIntegration {
      #   id
      #   label
      #   fb_page
      #   disabled
      # }
    }
  }
`;
