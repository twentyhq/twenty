import { gql } from '@apollo/client';

export const CREATE_AGENT_CHAT_THREAD = gql`
  mutation CreateAgentChatThread($agentId: ID!) {
    createAgentChatThread(agentId: $agentId) {
      id
      agentId
      createdAt
      updatedAt
    }
  }
`;
