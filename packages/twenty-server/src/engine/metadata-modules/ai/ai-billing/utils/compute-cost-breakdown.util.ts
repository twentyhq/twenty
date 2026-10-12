import { type AiModelCostConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-cost-config.type';
import { ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';

export type TokenUsageInput = {
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
  cacheCreationTokens?: number;
};

export type CostBreakdown = {
  totalCostInDollars: number;
  inputCostInDollars: number;
  outputCostInDollars: number;
  tokenCounts: {
    adjustedInputTokens: number;
    adjustedOutputTokens: number;
    cachedInputTokens: number;
    cacheCreationTokens: number;
    reasoningTokens: number;
    totalInputTokens: number;
  };
};

const safeNumber = (value: number | undefined): number => {
  const result = value ?? 0;

  return Number.isFinite(result) ? result : 0;
};

// every provider we use counts cached and cache-creation tokens inside inputTokens
// Anthropic's outputTokens excludes reasoning tokens; OpenAI/xAI/Groq/Google include them
export const computeCostBreakdown = (
  model: AiModelCostConfig,
  usage: TokenUsageInput,
): CostBreakdown => {
  const rawInputTokens = safeNumber(usage.inputTokens);
  const rawOutputTokens = safeNumber(usage.outputTokens);
  const reasoningTokens = safeNumber(usage.reasoningTokens);
  const cachedInputTokens = safeNumber(usage.cachedInputTokens);
  const cacheCreationTokens = safeNumber(usage.cacheCreationTokens);

  const isAnthropicTokenReporting = model.modelFamily === ModelFamily.CLAUDE;

  const adjustedInputTokens = Math.max(
    0,
    rawInputTokens - cachedInputTokens - cacheCreationTokens,
  );

  const adjustedOutputTokens = isAnthropicTokenReporting
    ? rawOutputTokens
    : Math.max(0, rawOutputTokens - reasoningTokens);

  const totalInputTokens = rawInputTokens;

  const costInfo =
    model.longContextCost &&
    totalInputTokens > model.longContextCost.thresholdTokens
      ? model.longContextCost
      : model;

  const inputRate = costInfo.inputCostPerMillionTokens;
  const outputRate = costInfo.outputCostPerMillionTokens;
  const cachedRate = costInfo.cachedInputCostPerMillionTokens ?? inputRate;
  const cacheCreationRate =
    costInfo.cacheCreationCostPerMillionTokens ?? inputRate;

  const inputCostInDollars =
    (adjustedInputTokens / 1_000_000) * inputRate +
    (cachedInputTokens / 1_000_000) * cachedRate +
    (cacheCreationTokens / 1_000_000) * cacheCreationRate;

  const outputCostInDollars =
    (adjustedOutputTokens / 1_000_000) * outputRate +
    (reasoningTokens / 1_000_000) * outputRate;

  return {
    totalCostInDollars: inputCostInDollars + outputCostInDollars,
    inputCostInDollars,
    outputCostInDollars,
    tokenCounts: {
      adjustedInputTokens,
      adjustedOutputTokens,
      cachedInputTokens,
      cacheCreationTokens,
      reasoningTokens,
      totalInputTokens,
    },
  };
};
