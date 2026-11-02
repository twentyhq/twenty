import {
  type AgentMessageRow,
  mapAgentMessagesToUIMessages,
} from 'twenty-shared/ai';

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

export const listConversationMessages = async (
  conversation: AgentConversationInput,
): Promise<AgentConversationHistory> => {
  const { messages, streamCatchup } = await postGraphqlRequest<
    AgentConversationInput,
    Pick<AgentConversationHistory, 'streamCatchup'> & {
      messages: AgentMessageRow[];
    }
  >({
    query: CONVERSATION_MESSAGES_QUERY,
    variables: conversation,
    caller: 'listConversationMessages',
  });

  return {
    messages: mapAgentMessagesToUIMessages(messages),
    streamCatchup,
  };
};
