import {
  type AIModelConfig,
  ModelFamily,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models-types.const';

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

// Input token semantics differ by model family:
//   Anthropic: inputTokens excludes cached and cache creation tokens
//   OpenAI/xAI/Groq/Google: inputTokens includes cached tokens
// Output token semantics also differ:
//   Anthropic: outputTokens excludes reasoning (thinking) tokens
//   OpenAI/xAI/Groq/Google: outputTokens includes reasoning tokens
export const computeCostBreakdown = (
  model: AIModelConfig,
  usage: TokenUsageInput,
): CostBreakdown => {
  const rawInputTokens = safeNumber(usage.inputTokens);
  const rawOutputTokens = safeNumber(usage.outputTokens);
  const reasoningTokens = safeNumber(usage.reasoningTokens);
  const cachedInputTokens = safeNumber(usage.cachedInputTokens);
  const cacheCreationTokens = safeNumber(usage.cacheCreationTokens);

  const isAnthropicFamily = model.modelFamily === ModelFamily.ANTHROPIC;

  const adjustedInputTokens = isAnthropicFamily
    ? rawInputTokens
    : Math.max(0, rawInputTokens - cachedInputTokens);

  const adjustedOutputTokens = isAnthropicFamily
    ? rawOutputTokens
    : Math.max(0, rawOutputTokens - reasoningTokens);

  const totalInputTokens = isAnthropicFamily
    ? rawInputTokens + cachedInputTokens + cacheCreationTokens
    : rawInputTokens + cacheCreationTokens;

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
