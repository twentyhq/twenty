import { gql } from '@apollo/client';

export const ADD_INBOX_MESSAGE_REACTION = gql`
  mutation AddAgentChatMessageReaction($messageId: UUID!, $emoji: String!) {
    addAgentChatMessageReaction(messageId: $messageId, emoji: $emoji) {
      emoji
      workspaceMemberIds
      agentIds
      hasAssistantReacted
    }
  }
`;
