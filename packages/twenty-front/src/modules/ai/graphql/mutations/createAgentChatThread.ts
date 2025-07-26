import { gql } from '@apollo/client';

export const CREATE_AGENT_CHAT_THREAD = gql`
  mutation CreateAgentChatThread($input: CreateAgentChatThreadInput!) {
    createAgentChatThread(input: $input) {
      id
      agentId
      title
      createdAt
      updatedAt
    }
  }
`;
