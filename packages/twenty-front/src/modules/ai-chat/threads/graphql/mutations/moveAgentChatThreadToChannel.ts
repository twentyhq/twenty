import { gql } from '@apollo/client';

export const MOVE_INBOX_THREAD_TO_CHANNEL = gql`
  mutation MoveAgentChatThreadToChannel($threadId: UUID!, $channelId: UUID) {
    moveAgentChatThreadToChannel(threadId: $threadId, channelId: $channelId)
  }
`;
