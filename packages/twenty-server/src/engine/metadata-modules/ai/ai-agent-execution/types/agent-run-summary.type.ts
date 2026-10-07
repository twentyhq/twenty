import { type AgentRunToolCallLog } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-tool-call-log.type';

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
