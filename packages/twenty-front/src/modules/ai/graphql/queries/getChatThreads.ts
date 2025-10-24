import { gql } from '@apollo/client';

export const GET_CHAT_THREADS = gql`
  query GetChatThreads {
    chatThreads {
      id
      title
      createdAt
      updatedAt
    }
  }
`;
