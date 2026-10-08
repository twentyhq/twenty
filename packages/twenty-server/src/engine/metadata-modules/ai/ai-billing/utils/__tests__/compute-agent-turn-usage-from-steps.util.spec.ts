import { computeAgentTurnUsageFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/compute-agent-turn-usage-from-steps.util';
import { type AiModelCostConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-cost-config.type';

const MODEL_COST_CONFIG: AiModelCostConfig = {
  modelId: 'test-model',
  inputCostPerMillionTokens: 1,
  outputCostPerMillionTokens: 2,
  cachedInputCostPerMillionTokens: 0.5,
  longContextCost: {
    inputCostPerMillionTokens: 10,
    outputCostPerMillionTokens: 20,
    thresholdTokens: 200_000,
  },
};

describe('computeAgentTurnUsageFromSteps', () => {
  it('is empty for an execution without steps', () => {
    expect(computeAgentTurnUsageFromSteps(MODEL_COST_CONFIG, [])).toEqual({
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
      inputCredits: 0,
      outputCredits: 0,
    });
  });

  it('prices each step on its own, so two steps under the long-context threshold keep the base rate', () => {
    const step = { usage: { inputTokens: 150_000, outputTokens: 1_000 } };

    expect(
      computeAgentTurnUsageFromSteps(MODEL_COST_CONFIG, [step, step]),
    ).toEqual({
      inputTokens: 300_000,
      outputTokens: 2_000,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
      inputCredits: 300_000,
      outputCredits: 4_000,
    });
  });

  it('counts cache reads and cache writes', () => {
    const turnUsage = computeAgentTurnUsageFromSteps(MODEL_COST_CONFIG, [
      {
        usage: {
          inputTokens: 1_000,
          outputTokens: 10,
          inputTokenDetails: { cacheReadTokens: 400 },
        },
        providerMetadata: {
          anthropic: { cacheCreationInputTokens: 200 },
        },
      },
    ]);

    expect(turnUsage).toMatchObject({
      cacheReadTokens: 400,
      cacheCreationTokens: 200,
    });
  });
});
