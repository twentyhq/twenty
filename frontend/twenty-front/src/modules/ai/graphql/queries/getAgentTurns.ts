import { gql } from '@apollo/client';

export const GET_AGENT_TURNS = gql`
  query GetAgentTurns($agentId: UUID!) {
    agentTurns(agentId: $agentId) {
      id
      threadId
      agentId
      createdAt
      evaluations {
        id
        score
        comment
        createdAt
      }
      messages {
        id
        role
        createdAt
        parts {
          id
          type
          textContent
          reasoningContent
          toolName
          toolCallId
          toolInput
          toolOutput
          errorMessage
          state
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
        }
      }
    }
  }
`;
