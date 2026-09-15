import { gql } from '@apollo/client';

export const GET_CHAT_THREADS = gql`
  query GetChatThreads {
    chatThreads {
      id
      title
      lastMessageUsage {
        inputTokens
        outputTokens
        cachedInputTokens
        inputCredits
        outputCredits
      }
      totalCacheReadTokens
      totalInputTokens
      totalOutputTokens
      contextWindowTokens
      conversationSize
      totalInputCredits
      totalOutputCredits
      deletedAt
      lastMessageAt
      createdAt
      updatedAt
    }
  }
`;
