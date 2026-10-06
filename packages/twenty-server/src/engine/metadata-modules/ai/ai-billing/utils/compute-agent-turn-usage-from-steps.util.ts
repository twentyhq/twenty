import { type BillingTokenUsage } from 'src/engine/metadata-modules/ai/ai-billing/types/billing-token-usage.type';
import { computeStepCostBreakdown } from 'src/engine/metadata-modules/ai/ai-billing/utils/compute-step-cost-breakdown.util';
import { convertDollarsToCreditsMicro } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-credits-micro.util';
import { extractCacheCreationTokens } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { type AgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-history/types/agent-turn-usage.type';
import { type AiModelCostConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-cost-config.type';

type AgentTurnUsageStep = {
  usage?: BillingTokenUsage;
  providerMetadata?: Record<string, Record<string, unknown> | undefined>;
};

const EMPTY_AGENT_TURN_USAGE: AgentTurnUsage = {
  inputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheCreationTokens: 0,
  inputCredits: 0,
  outputCredits: 0,
};

// each step is priced on its own, so a chat stream adding steps as they end
// and an execution adding them at the end reach the same totals
export const addStepToAgentTurnUsage = (
  model: AiModelCostConfig,
  turnUsage: AgentTurnUsage,
  step: AgentTurnUsageStep,
): AgentTurnUsage => {
  const cacheCreationTokens = extractCacheCreationTokens(step.providerMetadata);
  const breakdown = computeStepCostBreakdown(model, {
    usage: step.usage,
    cacheCreationTokens,
  });

  return {
    inputTokens: turnUsage.inputTokens + breakdown.tokenCounts.totalInputTokens,
    outputTokens: turnUsage.outputTokens + (step.usage?.outputTokens ?? 0),
    cacheReadTokens:
      turnUsage.cacheReadTokens + breakdown.tokenCounts.cachedInputTokens,
    cacheCreationTokens: turnUsage.cacheCreationTokens + cacheCreationTokens,
    inputCredits:
      turnUsage.inputCredits +
      convertDollarsToCreditsMicro(breakdown.inputCostInDollars),
    outputCredits:
      turnUsage.outputCredits +
      convertDollarsToCreditsMicro(breakdown.outputCostInDollars),
  };
};

export const computeAgentTurnUsageFromSteps = (
  model: AiModelCostConfig,
  steps: AgentTurnUsageStep[],
): AgentTurnUsage =>
  steps.reduce<AgentTurnUsage>(
    (turnUsage, step) => addStepToAgentTurnUsage(model, turnUsage, step),
    EMPTY_AGENT_TURN_USAGE,
  );
