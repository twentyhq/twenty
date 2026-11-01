import { type AgentRunSummary } from 'twenty-shared/ai';

export const buildStartedAgentRunSummary = (
  modelId: string,
): AgentRunSummary => ({
  modelId,
  usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
  cost: { totalCostInDollars: 0, creditsUsedMicro: 0 },
  nativeWebSearchCallCount: 0,
  toolCalls: [],
  durationMs: 0,
});
