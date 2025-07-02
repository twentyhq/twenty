import { gql } from '@apollo/client';

export const AGENT_CHAT_THREADS = gql`
  query AgentChatThreads($agentId: ID!) {
    agentChatThreads(agentId: $agentId) {
      id
      agentId
      createdAt
      updatedAt
    }
  }
`;
