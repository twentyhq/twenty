import { type LanguageModelUsage, type StepResult, type ToolSet } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type AgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-billing/types/agent-turn-usage.type';

export type AgentExecutionResult = {
  result: object;
  usage: LanguageModelUsage;
  cacheCreationTokens: number;
  nativeWebSearchCallCount: number;
  hasNoMoreAvailableCredits: boolean;
  isPaused: boolean;
  steps: StepResult<ToolSet>[];
  replyParts: ExtendedUIMessagePart[];
  modelId: string;
  totalCostInDollars: number;
  creditsUsedMicro: number;
  turnUsage: AgentTurnUsage;
};
