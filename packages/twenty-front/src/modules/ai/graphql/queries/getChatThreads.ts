import { gql } from '@apollo/client';

export const GET_CHAT_THREADS = gql`
  query GetChatThreads($paging: CursorPaging) {
    chatThreads(paging: $paging) {
      edges {
        node {
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
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
