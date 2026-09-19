import { gql } from '@apollo/client';

export const GET_UNREAD_CHAT_THREAD_IDS = gql`
  query GetUnreadChatThreadIds($threadIds: [UUID!]!) {
    unreadChatThreadIds(threadIds: $threadIds)
  }
`;
