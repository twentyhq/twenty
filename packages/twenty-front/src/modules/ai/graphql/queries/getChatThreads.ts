import { gql } from '@apollo/client';

export const GET_CHAT_THREADS = gql`
  query GetChatThreads($input: ChatThreadsQueryInput) {
    chatThreads(input: $input) {
      threads {
        id
        title
        totalInputTokens
        totalOutputTokens
        contextWindowTokens
        conversationSize
        totalInputCredits
        totalOutputCredits
        createdAt
        updatedAt
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
