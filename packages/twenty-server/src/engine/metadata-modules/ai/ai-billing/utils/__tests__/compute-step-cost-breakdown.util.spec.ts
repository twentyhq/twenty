import { computeStepCostBreakdown } from 'src/engine/metadata-modules/ai/ai-billing/utils/compute-step-cost-breakdown.util';
import { type AiModelCostConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-cost-config.type';

const MODEL_COST_CONFIG: AiModelCostConfig = {
  modelId: 'test-model',
  inputCostPerMillionTokens: 1,
  outputCostPerMillionTokens: 2,
  cachedInputCostPerMillionTokens: 0.5,
  cacheCreationCostPerMillionTokens: 3,
  longContextCost: {
    inputCostPerMillionTokens: 10,
    outputCostPerMillionTokens: 20,
    cacheCreationCostPerMillionTokens: 30,
    thresholdTokens: 200_000,
  },
};

const CLAUDE_SONNET_COST_CONFIG: AiModelCostConfig = {
  modelId: 'claude-sonnet-4-6',
  inputCostPerMillionTokens: 3,
  outputCostPerMillionTokens: 15,
  cachedInputCostPerMillionTokens: 0.3,
  cacheCreationCostPerMillionTokens: 3.75,
};

describe('computeStepCostBreakdown', () => {
  it('applies the long-context rate only when the step itself crosses the threshold', () => {
    const stepUnderThreshold = computeStepCostBreakdown({
      model: MODEL_COST_CONFIG,
      usage: {
        inputTokens: 150_000,
        outputTokens: 1_000,
      },
    });
    const stepOverThreshold = computeStepCostBreakdown({
      model: MODEL_COST_CONFIG,
      usage: {
        inputTokens: 300_000,
        outputTokens: 2_000,
      },
    });

    expect(2 * stepUnderThreshold.totalCostInDollars).toBeCloseTo(0.304);
    expect(stepOverThreshold.totalCostInDollars).toBeCloseTo(3.04);
  });

  it('reads cache reads and reasoning tokens from the usage details', () => {
    const breakdown = computeStepCostBreakdown({
      model: MODEL_COST_CONFIG,
      usage: {
        inputTokens: 100_000,
        outputTokens: 10_000,
        inputTokenDetails: { cacheReadTokens: 40_000 },
        outputTokenDetails: { reasoningTokens: 4_000 },
      },
    });

    expect(breakdown.inputCostInDollars).toBeCloseTo(0.08);
    expect(breakdown.outputCostInDollars).toBeCloseTo(0.02);
    expect(breakdown.tokenCounts).toMatchObject({
      adjustedInputTokens: 60_000,
      cachedInputTokens: 40_000,
      reasoningTokens: 4_000,
    });
  });

  it('prices cache writes at the cache creation rate', () => {
    const breakdown = computeStepCostBreakdown({
      model: MODEL_COST_CONFIG,
      usage: {
        inputTokens: 100_000,
        outputTokens: 0,
        inputTokenDetails: { cacheWriteTokens: 100_000 },
      },
    });

    expect(breakdown.totalCostInDollars).toBeCloseTo(0.3);
    expect(breakdown.tokenCounts).toMatchObject({
      adjustedInputTokens: 0,
      cacheCreationTokens: 100_000,
    });
  });

  it('prices Claude thinking once since outputTokens already includes it', () => {
    const cacheReadTurn = computeStepCostBreakdown({
      model: CLAUDE_SONNET_COST_CONFIG,
      usage: {
        inputTokens: 21_200,
        outputTokens: 6_000,
        inputTokenDetails: { cacheReadTokens: 20_000, cacheWriteTokens: 0 },
        outputTokenDetails: { reasoningTokens: 4_500 },
      },
    });
    const cacheWriteTurn = computeStepCostBreakdown({
      model: CLAUDE_SONNET_COST_CONFIG,
      usage: {
        inputTokens: 21_200,
        outputTokens: 6_000,
        inputTokenDetails: { cacheReadTokens: 0, cacheWriteTokens: 20_000 },
        outputTokenDetails: { reasoningTokens: 4_500 },
      },
    });

    expect(cacheReadTurn.totalCostInDollars).toBeCloseTo(0.0996, 6);
    expect(cacheWriteTurn.totalCostInDollars).toBeCloseTo(0.1686, 6);
  });

  it('costs nothing for a step without usage', () => {
    expect(
      computeStepCostBreakdown({ model: MODEL_COST_CONFIG }).totalCostInDollars,
    ).toBe(0);
  });
});
