import { gql, type TypedDocumentNode } from '@apollo/client';
import { type AgentChatThreadRowMetadata } from 'twenty-shared/ai';

export const GET_AGENT_CHAT_THREAD_ROW_METADATA: TypedDocumentNode<
  { agentChatThreadRowMetadata: AgentChatThreadRowMetadata[] },
  { threadIds: string[] }
> = gql`
  query GetAgentChatThreadRowMetadata($threadIds: [UUID!]!) {
    agentChatThreadRowMetadata(threadIds: $threadIds) {
      threadId
      activityAt
      pendingQuestionMessageId
      messageId
      previewText
      senderType
      senderId
      senderName
      executionOutcome
    }
  }
`;
