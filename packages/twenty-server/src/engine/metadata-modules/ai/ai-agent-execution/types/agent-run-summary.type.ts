export type AgentRunToolCallLog = {
  toolName: string;
  toolCallId: string;
  providerExecuted?: boolean;
  input?: unknown;
  output?: unknown;
  errorMessage?: string;
  state: 'started' | 'success' | 'error' | 'awaiting-approval';
};

export type AgentRunSummary = {
  modelId: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    reasoningTokens?: number;
    cacheReadTokens?: number;
    cacheCreationTokens?: number;
    totalTokens: number;
  };
  cost: {
    totalCostInDollars: number;
    creditsUsedMicro: number;
  };
  nativeWebSearchCallCount: number;
  toolCalls: AgentRunToolCallLog[];
  durationMs: number;
};
