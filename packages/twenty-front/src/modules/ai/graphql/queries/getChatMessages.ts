import { gql } from '@apollo/client';

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($threadId: UUID!) {
    chatMessages(threadId: $threadId) {
      id
      threadId
      turnId
      role
      status
      createdAt
      parts {
        id
        messageId
        orderIndex
        type
        textContent
        reasoningContent
        toolName
        toolCallId
        toolInput
        toolOutput
        state
        providerExecuted
        errorMessage
        errorDetails
        sourceUrlSourceId
        sourceUrlUrl
        sourceUrlTitle
        sourceDocumentSourceId
        sourceDocumentMediaType
        sourceDocumentTitle
        sourceDocumentFilename
        fileMediaType
        fileFilename
        fileUrl
        fileId
        providerMetadata
        createdAt
      }
    }
    chatStreamCatchupChunks(threadId: $threadId) {
      chunks
      maxSeq
    }
  }
`;
