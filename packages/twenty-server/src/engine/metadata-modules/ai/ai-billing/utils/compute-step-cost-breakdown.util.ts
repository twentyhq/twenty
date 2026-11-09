import { type BillingTokenUsage } from 'src/engine/metadata-modules/ai/ai-billing/types/billing-token-usage.type';
import {
  computeCostBreakdown,
  type CostBreakdown,
} from 'src/engine/metadata-modules/ai/ai-billing/utils/compute-cost-breakdown.util';
import { type AiModelCostConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-cost-config.type';

export const computeStepCostBreakdown = ({
  model,
  usage,
}: {
  model: AiModelCostConfig;
  usage?: BillingTokenUsage;
}): CostBreakdown =>
  computeCostBreakdown(model, {
    inputTokens: usage?.inputTokens,
    outputTokens: usage?.outputTokens,
    reasoningTokens: usage?.outputTokenDetails?.reasoningTokens,
    cachedInputTokens: usage?.inputTokenDetails?.cacheReadTokens,
    cacheCreationTokens: usage?.inputTokenDetails?.cacheWriteTokens,
  });
