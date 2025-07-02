import { gql } from '@apollo/client';

export const SEND_AGENT_CHAT_MESSAGE = gql`
  mutation SendAgentChatMessage($threadId: ID!, $content: String!) {
    sendAgentChatMessage(threadId: $threadId, content: $content) {
      id
      threadId
      role
      content
      createdAt
    }
  }
`;
