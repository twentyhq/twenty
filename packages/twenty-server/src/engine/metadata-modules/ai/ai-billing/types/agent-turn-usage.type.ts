// credits are in micro credits, like the thread totals they add up to
export type AgentTurnUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  inputCredits: number;
  outputCredits: number;
};
