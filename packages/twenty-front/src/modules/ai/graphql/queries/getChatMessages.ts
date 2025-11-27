import { gql } from '@apollo/client';

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($threadId: UUID!) {
    chatMessages(threadId: $threadId) {
      id
      threadId
      turnId
      role
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
        providerMetadata
        createdAt
      }
    }
  }
`;
