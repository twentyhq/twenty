import { gql } from '@apollo/client';

export const GET_CHAT_THREADS = gql`
  query GetChatThreads {
    chatThreads {
      id
      title
      totalInputTokens
      totalOutputTokens
      contextWindowTokens
      totalInputCredits
      totalOutputCredits
      createdAt
      updatedAt
    }
  }
`;
