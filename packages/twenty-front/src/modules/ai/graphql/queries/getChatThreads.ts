import { gql } from '@apollo/client';

export const GET_CHAT_THREADS = gql`
  query GetChatThreads {
    chatThreads {
      id
      title
      channelId
      workflowRunId
      workflowStepId
      ownerUserWorkspaceId
      totalCacheReadTokens
      totalInputTokens
      totalOutputTokens
      contextWindowTokens
      conversationSize
      totalInputCredits
      totalOutputCredits
      status
      snoozedUntil
      assigneeUserWorkspaceId
      deletedAt
      lastMessageAt
      lastMessagePreview
      lastMessageRole
      lastMessageAuthorUserWorkspaceId
      createdAt
      updatedAt
    }
  }
`;
