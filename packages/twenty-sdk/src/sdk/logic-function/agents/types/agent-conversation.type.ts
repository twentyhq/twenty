// an application names its conversation with an agent by the key it passes to runAgent
export type AgentConversationInput = {
  agentUniversalIdentifier: string;
  threadKey: string;
};

// the fields the chat reads, as stored; parts map to AI SDK message parts as the chat maps them
export type AgentConversationMessagePart = {
  id: string;
  messageId: string;
  orderIndex: number;
  type: string;
  textContent: string | null;
  reasoningContent: string | null;
  toolName: string | null;
  toolCallId: string | null;
  toolInput: unknown;
  toolOutput: unknown;
  state: string | null;
  providerExecuted: boolean | null;
  errorMessage: string | null;
  sourceUrlSourceId: string | null;
  sourceUrlUrl: string | null;
  sourceUrlTitle: string | null;
  sourceDocumentSourceId: string | null;
  sourceDocumentMediaType: string | null;
  sourceDocumentTitle: string | null;
  sourceDocumentFilename: string | null;
  fileMediaType: string | null;
  fileFilename: string | null;
  fileUrl: string | null;
  fileId: string | null;
  providerMetadata: Record<string, unknown> | null;
  createdAt: string;
};

export type AgentConversationMessage = {
  id: string;
  threadId: string;
  turnId: string | null;
  senderWorkspaceMemberId: string | null;
  role: 'system' | 'user' | 'assistant';
  status: string;
  createdAt: string;
  processedAt: string | null;
  parts: AgentConversationMessagePart[];
  reactions: {
    emoji: string;
    workspaceMemberIds: string[];
    agentIds: string[];
    hasAssistantReacted: boolean;
  }[];
};

export type AgentConversationHistory = {
  messages: AgentConversationMessage[];
  // the chunks of a reply still streaming; live chunks with a seq up to maxSeq repeat them
  streamCatchup: {
    chunks: Record<string, unknown>[];
    maxSeq: number;
    error: { code: string; message: string } | null;
  };
};
