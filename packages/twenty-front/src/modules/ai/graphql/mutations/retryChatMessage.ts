import { gql } from '@apollo/client';

export const RETRY_CHAT_MESSAGE = gql`
  mutation RetryChatMessage($threadId: UUID!, $modelId: String) {
    retryChatMessage(threadId: $threadId, modelId: $modelId) {
      messageId
      queued
      streamId
    }
  }
`;
