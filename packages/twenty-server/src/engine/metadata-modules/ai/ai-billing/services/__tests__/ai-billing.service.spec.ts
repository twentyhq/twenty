import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { type AiModelCostConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-cost-config.type';

const MODEL_COST_CONFIG: AiModelCostConfig = {
  modelId: 'test-model',
  inputCostPerMillionTokens: 1,
  outputCostPerMillionTokens: 2,
  cacheCreationCostPerMillionTokens: 3,
  longContextCost: {
    inputCostPerMillionTokens: 10,
    outputCostPerMillionTokens: 20,
    cacheCreationCostPerMillionTokens: 30,
    thresholdTokens: 200_000,
  },
};

describe('AiBillingService', () => {
  const aiModelRegistryService = {
    getEvaluationModelConfig: jest.fn().mockReturnValue(undefined),
    getEffectiveModelConfig: jest.fn().mockReturnValue(MODEL_COST_CONFIG),
  };

  const aiBillingService = new AiBillingService(
    {} as never,
    aiModelRegistryService as never,
    {} as never,
    {} as never,
  );

  describe('calculateStepsCost', () => {
    it('prices each step on its own, so steps under the long-context threshold never reach its rate together', () => {
      const steps = [
        { usage: { inputTokens: 150_000, outputTokens: 1_000 } },
        { usage: { inputTokens: 150_000, outputTokens: 1_000 } },
      ];

      const summedUsageCost = aiBillingService.calculateCost('test-model', {
        usage: { inputTokens: 300_000, outputTokens: 2_000 },
      });

      expect(
        aiBillingService.calculateStepsCost('test-model', steps),
      ).toBeCloseTo(0.304);
      expect(summedUsageCost).toBeCloseTo(3.04);
    });

    it('applies the long-context rate to the step that crosses the threshold only', () => {
      const steps = [
        { usage: { inputTokens: 100_000, outputTokens: 0 } },
        { usage: { inputTokens: 250_000, outputTokens: 0 } },
      ];

      expect(
        aiBillingService.calculateStepsCost('test-model', steps),
      ).toBeCloseTo(2.6);
    });

    it('prices each step with its own cache creation tokens', () => {
      const steps = [
        {
          usage: { inputTokens: 100_000, outputTokens: 0 },
          providerMetadata: {
            anthropic: { cacheCreationInputTokens: 100_000 },
          },
        },
        { usage: { inputTokens: 100_000, outputTokens: 0 } },
      ];

      expect(
        aiBillingService.calculateStepsCost('test-model', steps),
      ).toBeCloseTo(0.4);
    });

    it('costs nothing without steps', () => {
      expect(aiBillingService.calculateStepsCost('test-model', [])).toBe(0);
    });
  });
});
