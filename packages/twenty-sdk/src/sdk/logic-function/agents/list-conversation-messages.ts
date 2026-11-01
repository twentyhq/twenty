import {
  type AgentConversationHistory,
  type AgentConversationInput,
} from '@/sdk/logic-function/agents/types/agent-conversation.type';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const CONVERSATION_MESSAGES_QUERY = `
  query ConversationMessages($agentUniversalIdentifier: UUID!, $threadKey: String!) {
    messages: chatMessages(agentUniversalIdentifier: $agentUniversalIdentifier, threadKey: $threadKey) {
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
    streamCatchup: chatStreamCatchupChunks(agentUniversalIdentifier: $agentUniversalIdentifier, threadKey: $threadKey) {
      chunks
      maxSeq
      error {
        code
        message
      }
    }
  }
`;

export const listConversationMessages = (
  conversation: AgentConversationInput,
): Promise<AgentConversationHistory> =>
  postGraphqlRequest<AgentConversationInput, AgentConversationHistory>({
    query: CONVERSATION_MESSAGES_QUERY,
    variables: conversation,
    caller: 'listConversationMessages',
  });
