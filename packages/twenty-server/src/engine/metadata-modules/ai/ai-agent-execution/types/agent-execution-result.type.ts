import { type LanguageModelUsage, type StepResult, type ToolSet } from 'ai';

export interface AgentExecutionResult {
  result: object;
  usage: LanguageModelUsage;
  cacheCreationTokens: number;
  nativeWebSearchCallCount: number;
  hasNoMoreAvailableCredits: boolean;
  steps?: StepResult<ToolSet>[];
  modelId?: string;
  totalCostInDollars?: number;
  creditsUsedMicro?: number;
  // Set when the loop ended on a tool the caller asked to pause on; the
  // result then holds no final answer.
  pausedOnToolName?: string;
}
