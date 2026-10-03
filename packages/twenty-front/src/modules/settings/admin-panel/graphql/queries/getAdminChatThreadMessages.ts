import { gql } from '@apollo/client';

export const GET_ADMIN_CHAT_THREAD_MESSAGES = gql`
  query GetAdminChatThreadMessages($threadId: UUID!) {
    getAdminChatThreadMessages(threadId: $threadId) {
      thread {
        id
        title
        totalInputTokens
        totalOutputTokens
        conversationSize
        messageCount
        createdAt
        updatedAt
      }
      messages {
        id
        role
        parts {
          type
          orderIndex
          textContent
          reasoningContent
          toolName
          toolCallId
          toolInput
          toolOutput
          state
          errorMessage
        }
        createdAt
      }
      contexts {
        context
        createdAt
      }
    }
  }
`;
