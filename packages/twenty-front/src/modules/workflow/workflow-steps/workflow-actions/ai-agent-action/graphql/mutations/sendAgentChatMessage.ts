import { gql } from '@apollo/client';

export const SEND_AGENT_CHAT_MESSAGE = gql`
  mutation SendAgentChatMessage($threadId: ID!, $message: String!) {
    sendAgentChatMessage(threadId: $threadId, message: $message) {
      id
      threadId
      sender
      message
      createdAt
    }
  }
`;
