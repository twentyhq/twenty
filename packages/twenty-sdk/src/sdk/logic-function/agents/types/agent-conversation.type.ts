// an application names its conversation with an agent by the key it passes to runAgent
export type AgentConversationInput = {
  agentUniversalIdentifier: string;
  threadKey: string;
};

// an AI SDK UIMessage, as the chat and its live chunks build it, typed without the ai package
export type AgentConversationMessage = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  parts: ({ type: string } & Record<string, unknown>)[];
  metadata?: {
    createdAt?: string;
    startedAt?: string;
    finishedAt?: string;
    senderWorkspaceMemberId?: string | null;
    // the run the message belongs to, as runAgent() returns it
    turnId?: string | null;
  };
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
