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
      whatsappIntegration {
        id
        label
        phoneId
        disabled
      }
      # messengerIntegration {
      #   id
      #   label
      #   fb_page
      #   disabled
      # }
    }
  }
`;
