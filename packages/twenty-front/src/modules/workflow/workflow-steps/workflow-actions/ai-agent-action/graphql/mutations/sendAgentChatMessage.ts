import { gql } from '@apollo/client';

export const SEND_AGENT_CHAT_MESSAGE = gql`
  mutation SendAgentChatMessage($input: SendAgentChatMessageInput!) {
    sendAgentChatMessage(input: $input) {
      id
      threadId
      sender
      message
      createdAt
    }
  }
`;
