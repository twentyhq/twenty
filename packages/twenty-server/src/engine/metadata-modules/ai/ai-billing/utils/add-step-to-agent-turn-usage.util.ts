import { type BillingTokenUsage } from 'src/engine/metadata-modules/ai/ai-billing/types/billing-token-usage.type';
import { computeStepCostBreakdown } from 'src/engine/metadata-modules/ai/ai-billing/utils/compute-step-cost-breakdown.util';
import { convertDollarsToCreditsMicro } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-credits-micro.util';
import { extractCacheCreationTokens } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { type AgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-billing/types/agent-turn-usage.type';
import { type AiModelCostConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-cost-config.type';

export type AgentTurnUsageStep = {
  usage?: BillingTokenUsage;
  providerMetadata?: Record<string, Record<string, unknown> | undefined>;
};

// each step is priced on its own, so steps under the long-context threshold never reach its rate together
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
