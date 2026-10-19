import { gql } from '@apollo/client';

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($threadId: UUID!) {
    chatMessages(threadId: $threadId) {
      id
      threadId
      turnId
      senderWorkspaceMemberId
      role
      status
      createdAt
      processedAt
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
      reactions {
        emoji
        workspaceMemberIds
        agentIds
        hasAssistantReacted
      }
    }
    chatStreamCatchupChunks(threadId: $threadId) {
      chunks
      maxSeq
      error {
        code
        message
      }
    }
  }
`;
