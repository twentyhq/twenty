import { gql } from '@apollo/client';

export const REMOVE_AI_CHAT_MESSAGE_REACTION = gql`
  mutation RemoveAgentChatMessageReaction($messageId: UUID!, $emoji: String!) {
    removeAgentChatMessageReaction(messageId: $messageId, emoji: $emoji) {
      emoji
      workspaceMemberIds
      agentIds
      hasAssistantReacted
    }
  }
`;
