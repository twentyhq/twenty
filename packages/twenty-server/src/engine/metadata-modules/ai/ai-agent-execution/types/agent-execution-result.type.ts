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
}
