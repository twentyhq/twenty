import { gql } from '@apollo/client';

export const GET_ALL_AGENTS = gql`
  query AgentsByWorkspace($workspaceId: String!) {
    agentsByWorkspace(workspaceId: $workspaceId) {
      id
      isAdmin
      isActive
      memberId
      workspace {
        id
        displayName
      }
      sectors {
        id
        name
      }
      inboxes {
        id
        integrationType
        whatsappIntegrationId
      }
    }
  }
`;
