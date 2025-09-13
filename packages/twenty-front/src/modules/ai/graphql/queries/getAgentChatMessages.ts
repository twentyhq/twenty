import { gql } from '@apollo/client';

export const GET_AGENT_CHAT_MESSAGES = gql`
  query GetAgentChatMessages($threadId: UUID!) {
    agentChatMessages(threadId: $threadId) {
      id
      threadId
      role
      content
      createdAt
      streamData
      files {
        id
        name
        fullPath
        size
        type
        createdAt
      }
    }
  }
`;
