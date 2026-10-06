import { type LanguageModelUsage, type StepResult, type ToolSet } from 'ai';

import { type AgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-history/types/agent-turn-usage.type';

export type AgentExecutionResult = {
  result: object;
  usage: LanguageModelUsage;
  cacheCreationTokens: number;
  nativeWebSearchCallCount: number;
  hasNoMoreAvailableCredits: boolean;
  isPaused: boolean;
  steps: StepResult<ToolSet>[];
  modelId: string;
  totalCostInDollars: number;
  creditsUsedMicro: number;
  turnUsage: AgentTurnUsage;
};
