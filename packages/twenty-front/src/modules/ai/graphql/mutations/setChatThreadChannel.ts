import { gql } from '@apollo/client';

export const SET_CHAT_THREAD_CHANNEL = gql`
  mutation SetChatThreadChannel($threadId: UUID!, $channelId: UUID) {
    setChatThreadChannel(threadId: $threadId, channelId: $channelId) {
      id
      channelId
      updatedAt
    }
  }
`;
