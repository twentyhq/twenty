import { gql } from '@apollo/client';

export const MARK_AGENT_CHAT_THREAD_AS_DONE_IN_CHANNEL = gql`
  mutation MarkAgentChatThreadAsDoneInChannel($threadId: UUID!) {
    markAgentChatThreadAsDoneInChannel(threadId: $threadId)
  }
`;
