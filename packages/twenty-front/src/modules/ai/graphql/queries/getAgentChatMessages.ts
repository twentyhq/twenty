import { gql } from '@apollo/client';

export const GET_AGENT_CHAT_MESSAGES = gql`
  query GetAgentChatMessages($threadId: UUID!) {
    agentChatMessages(threadId: $threadId) {
      id
      threadId
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
      files {
        id
        name
        fullPath
        size
        type
        createdAt
      }
    }
  }
`;
