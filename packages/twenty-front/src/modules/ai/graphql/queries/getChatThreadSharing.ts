import { gql } from '@apollo/client';

export const GET_CHAT_THREAD_SHARING = gql`
  query GetChatThreadSharing($threadId: UUID!) {
    chatThreadSharing(threadId: $threadId) {
      canManage
      isEnabled
      shares {
        id
        principalId
        principalType
      }
      roles {
        id
        label
      }
    }
  }
`;
