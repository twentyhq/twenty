import { gql } from '@apollo/client';

export const ON_AI_CHAT_EVENT = gql`
  subscription OnAgentChatEvent($threadId: UUID!) {
    onAgentChatEvent(threadId: $threadId) {
      threadId
      event
    }
  }
`;
