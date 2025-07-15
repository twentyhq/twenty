import { gql } from '@apollo/client';

export const GET_AGENT_CHAT_THREADS = gql`
  query GetAgentChatThreads($agentId: String!) {
    agentChatThreads(agentId: $agentId) {
      id
      agentId
      title
      createdAt
      updatedAt
    }
  }
`;
