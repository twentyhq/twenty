import { gql } from '@apollo/client';

export const AGENT_CHAT_MESSAGES = gql`
  query AgentChatMessages($threadId: ID!) {
    agentChatMessages(threadId: $threadId) {
      id
      threadId
      sender
      message
      createdAt
    }
  }
`;
