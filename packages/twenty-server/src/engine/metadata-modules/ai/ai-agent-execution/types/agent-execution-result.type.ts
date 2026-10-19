import { type LanguageModelUsage, type StepResult, type ToolSet } from 'ai';

import { type StepDebitResult } from 'src/engine/metadata-modules/ai/ai-billing/types/step-debit-result.type';

export type AgentExecutionResult = {
  result: object;
  usage: LanguageModelUsage;
  cacheCreationTokens: number;
  nativeWebSearchCallCount: number;
  stopReason: StepDebitResult['stopReason'];
  isPaused: boolean;
  steps: StepResult<ToolSet>[];
  modelId: string;
  totalCostInDollars: number;
  creditsUsedMicro: number;
};
