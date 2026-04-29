import { gql } from '@apollo/client';

export const ON_AGENT_CHAT_EVENT = gql`
  subscription OnAgentChatEvent($threadId: UUID!) {
    onAgentChatEvent(threadId: $threadId) {
      threadId
      event
    }
  }
`;
