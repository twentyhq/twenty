import { gql } from '@apollo/client';

export const STOP_AI_CHAT_STREAM = gql`
  mutation StopAgentChatStream($threadId: UUID!) {
    stopAgentChatStream(threadId: $threadId)
  }
`;
