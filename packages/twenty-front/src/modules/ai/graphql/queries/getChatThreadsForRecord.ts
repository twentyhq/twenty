import { gql } from '@apollo/client';

export const GET_CHAT_THREADS_FOR_RECORD = gql`
  query GetChatThreadsForRecord(
    $objectNameSingular: String!
    $recordId: UUID!
  ) {
    chatThreadsForRecord(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
    ) {
      id
      title
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
