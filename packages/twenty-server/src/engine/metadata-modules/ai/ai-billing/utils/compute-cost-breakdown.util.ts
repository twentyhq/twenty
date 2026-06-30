import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
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

// Input token semantics (all providers we use):
//   `inputTokens` is the FULL prompt size and already includes cached and
//   cache-creation tokens. The @ai-sdk/anthropic provider reports
//   inputTokens = noCache + cacheRead + cacheCreation, and OpenAI-style
//   providers include cached tokens (and never report cache-creation tokens).
//   So the uncached, full-rate portion is always inputTokens minus cached
//   minus cache-creation, and the full input size is just inputTokens.
// Output token semantics still differ by model family:
//   Anthropic: outputTokens excludes reasoning (thinking) tokens
//   OpenAI/xAI/Groq/Google: outputTokens includes reasoning tokens
export const computeCostBreakdown = (
  model: AiModelConfig,
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
