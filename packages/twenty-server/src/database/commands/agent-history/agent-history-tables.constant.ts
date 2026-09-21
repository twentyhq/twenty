import { AGENT_HISTORY_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-object-names.constant';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
const HISTORY_TABLES_BY_NAME = {
  agentChatThread: {
    name: 'agentChatThread',
    columns: [
      'id',
      'userWorkspaceId',
      'title',
      'totalInputTokens',
      'totalOutputTokens',
      'contextWindowTokens',
      'conversationSize',
      'totalInputCredits',
      'totalOutputCredits',
      'totalCacheReadTokens',
      'totalCacheCreationTokens',
      'activeStreamId',
      'pendingQuestionMessageId',
      'lastStreamError',
      'deletedAt',
      'createdAt',
      'updatedAt',
    ],
  },
  agentTurn: {
    name: 'agentTurn',
    columns: ['id', 'threadId', 'agentId', 'createdAt'],
  },
  agentMessage: {
    name: 'agentMessage',
    columns: [
      'id',
      'threadId',
      'turnId',
      'agentId',
      'role',
      'status',
      'isHidden',
      'processedAt',
      'createdAt',
    ],
  },
  agentMessagePart: {
    name: 'agentMessagePart',
    columns: [
      'id',
      'messageId',
      'orderIndex',
      'type',
      'textContent',
      'reasoningContent',
      'toolName',
      'toolCallId',
      'toolInput',
      'toolOutput',
      'state',
      'providerExecuted',
      'errorMessage',
      'errorDetails',
      'sourceUrlSourceId',
      'sourceUrlUrl',
      'sourceUrlTitle',
      'sourceDocumentSourceId',
      'sourceDocumentMediaType',
      'sourceDocumentTitle',
      'sourceDocumentFilename',
      'fileFilename',
      'fileId',
      'providerMetadata',
      'createdAt',
    ],
  },
  agentTurnEvaluation: {
    name: 'agentTurnEvaluation',
    columns: ['id', 'turnId', 'score', 'comment', 'createdAt'],
  },
} as const satisfies Record<
  AgentHistoryObjectName,
  { name: AgentHistoryObjectName; columns: readonly string[] }
>;

export const AGENT_HISTORY_TABLES = AGENT_HISTORY_OBJECT_NAMES.map(
  (name) => HISTORY_TABLES_BY_NAME[name],
);
