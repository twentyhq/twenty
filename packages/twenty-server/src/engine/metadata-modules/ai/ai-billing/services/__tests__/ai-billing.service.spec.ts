import { Test, type TestingModule } from '@nestjs/testing';

import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { AIBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import {
  InferenceProvider,
  ModelFamily,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models-types.const';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

describe('AIBillingService', () => {
  let service: AIBillingService;
  let mockWorkspaceEventEmitter: jest.Mocked<WorkspaceEventEmitter>;
  let mockAiModelRegistryService: jest.Mocked<
    Pick<AiModelRegistryService, 'getEffectiveModelConfig'>
  >;

  const openaiModelConfig = {
    modelId: 'gpt-4o',
    label: 'GPT-4o',
    modelFamily: ModelFamily.OPENAI,
    inferenceProvider: InferenceProvider.OPENAI,
    inputCostPerMillionTokens: 2.5,
    outputCostPerMillionTokens: 10.0,
    cachedInputCostPerMillionTokens: 1.25,
  };

  const anthropicModelConfig = {
    modelId: 'claude-sonnet-4-5-20250929',
    label: 'Claude Sonnet 4.5',
    modelFamily: ModelFamily.ANTHROPIC,
    inferenceProvider: InferenceProvider.ANTHROPIC,
    inputCostPerMillionTokens: 3.0,
    outputCostPerMillionTokens: 15.0,
    cachedInputCostPerMillionTokens: 0.3,
    cacheCreationCostPerMillionTokens: 3.75,
  };

  const mockTokenUsage = {
    inputTokens: 1000,
    outputTokens: 500,
    totalTokens: 1500,
  };

  beforeEach(async () => {
    const mockEventEmitterMethods = {
      emitCustomBatchEvent: jest.fn(),
    };

    const mockAiModelRegistryMethods = {
      getEffectiveModelConfig: jest.fn().mockReturnValue(openaiModelConfig),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIBillingService,
        {
          provide: WorkspaceEventEmitter,
          useValue: mockEventEmitterMethods,
        },
        {
          provide: AiModelRegistryService,
          useValue: mockAiModelRegistryMethods,
        },
      ],
    }).compile();

    service = module.get<AIBillingService>(AIBillingService);
    mockWorkspaceEventEmitter = module.get(WorkspaceEventEmitter);
    mockAiModelRegistryService = module.get(AiModelRegistryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCost', () => {
    it('should calculate cost correctly for basic token usage', () => {
      const costInDollars = service.calculateCost('gpt-4o', {
        usage: mockTokenUsage,
      });

      // (1000/1M * 2.5) + (500/1M * 10.0) = 0.0025 + 0.005 = 0.0075
      expect(costInDollars).toBeCloseTo(0.0075);
    });

    it('should apply cached rate for OpenAI cached tokens', () => {
      const costInDollars = service.calculateCost('gpt-4o', {
        usage: {
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
          cachedInputTokens: 600,
        },
      });

      // OpenAI: inputTokens includes cached, so adjusted = 1000 - 600 = 400
      // inputCost = (400/1M * 2.5) = 0.001
      // cachedCost = (600/1M * 1.25) = 0.00075
      // outputCost = (500/1M * 10.0) = 0.005
      // total = 0.00675
      expect(costInDollars).toBeCloseTo(0.00675);
    });

    it('should not subtract cached tokens from input for Anthropic', () => {
      mockAiModelRegistryService.getEffectiveModelConfig.mockReturnValue(
        anthropicModelConfig as ReturnType<
          AiModelRegistryService['getEffectiveModelConfig']
        >,
      );

      const costInDollars = service.calculateCost(
        'claude-sonnet-4-5-20250929',
        {
          usage: {
            inputTokens: 400,
            outputTokens: 500,
            totalTokens: 900,
            cachedInputTokens: 600,
          },
          cacheCreationTokens: 200,
        },
      );

      // Anthropic: inputTokens already excludes cached
      // inputCost = (400/1M * 3.0) = 0.0012
      // cachedCost = (600/1M * 0.3) = 0.00018
      // cacheCreationCost = (200/1M * 3.75) = 0.00075
      // outputCost = (500/1M * 15.0) = 0.0075
      // total = 0.00963
      expect(costInDollars).toBeCloseTo(0.00963);
    });

    it('should charge reasoning tokens at the output rate without double-counting for OpenAI', () => {
      const costInDollars = service.calculateCost('gpt-4o', {
        usage: {
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 2000,
          reasoningTokens: 500,
        },
      });

      // OpenAI: outputTokens (500) already includes reasoningTokens (500)
      // adjustedOutput = 500 - 500 = 0
      // inputCost = (1000/1M * 2.5) = 0.0025
      // outputCost = (0/1M * 10.0) = 0.0
      // reasoningCost = (500/1M * 10.0) = 0.005
      // total = 0.0075
      expect(costInDollars).toBeCloseTo(0.0075);
    });

    it('should fall back to input rate when cachedInputCostPerMillionTokens is undefined', () => {
      mockAiModelRegistryService.getEffectiveModelConfig.mockReturnValue({
        ...openaiModelConfig,
        cachedInputCostPerMillionTokens: undefined,
      } as ReturnType<AiModelRegistryService['getEffectiveModelConfig']>);

      const costInDollars = service.calculateCost('gpt-4o', {
        usage: {
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
          cachedInputTokens: 600,
        },
      });

      // Falls back to full input rate for cached tokens
      // adjusted = 1000 - 600 = 400
      // inputCost = (400/1M * 2.5) = 0.001
      // cachedCost = (600/1M * 2.5) = 0.0015 (fallback to input rate)
      // outputCost = (500/1M * 10.0) = 0.005
      // total = 0.0075
      expect(costInDollars).toBeCloseTo(0.0075);
    });

    it('should use long context pricing when input exceeds threshold', () => {
      const anthropicWithLongContext = {
        ...anthropicModelConfig,
        longContextCost: {
          inputCostPerMillionTokens: 6.0,
          outputCostPerMillionTokens: 22.5,
          cachedInputCostPerMillionTokens: 0.6,
          cacheCreationCostPerMillionTokens: 7.5,
          thresholdTokens: 200_000,
        },
      };

      mockAiModelRegistryService.getEffectiveModelConfig.mockReturnValue(
        anthropicWithLongContext as ReturnType<
          AiModelRegistryService['getEffectiveModelConfig']
        >,
      );

      const costInDollars = service.calculateCost(
        'claude-sonnet-4-5-20250929',
        {
          usage: {
            inputTokens: 150_000,
            outputTokens: 1000,
            totalTokens: 251_000,
            cachedInputTokens: 100_000,
          },
        },
      );

      // Anthropic: total input = 150k + 100k + 0 = 250k > 200k threshold
      // Uses long context rates
      // inputCost = (150_000/1M * 6.0) = 0.9
      // cachedCost = (100_000/1M * 0.6) = 0.06
      // outputCost = (1000/1M * 22.5) = 0.0225
      // total = 0.9825
      expect(costInDollars).toBeCloseTo(0.9825);
    });

    it('should use standard pricing when input is below threshold', () => {
      const anthropicWithLongContext = {
        ...anthropicModelConfig,
        longContextCost: {
          inputCostPerMillionTokens: 6.0,
          outputCostPerMillionTokens: 22.5,
          cachedInputCostPerMillionTokens: 0.6,
          cacheCreationCostPerMillionTokens: 7.5,
          thresholdTokens: 200_000,
        },
      };

      mockAiModelRegistryService.getEffectiveModelConfig.mockReturnValue(
        anthropicWithLongContext as ReturnType<
          AiModelRegistryService['getEffectiveModelConfig']
        >,
      );

      const costInDollars = service.calculateCost(
        'claude-sonnet-4-5-20250929',
        {
          usage: {
            inputTokens: 50_000,
            outputTokens: 1000,
            totalTokens: 51_000,
          },
        },
      );

      // Total input = 50k < 200k threshold -> standard rates
      // inputCost = (50_000/1M * 3.0) = 0.15
      // outputCost = (1000/1M * 15.0) = 0.015
      // total = 0.165
      expect(costInDollars).toBeCloseTo(0.165);
    });
  });

  describe('calculateAndBillUsage', () => {
    it('should calculate cost and emit billing event when model exists', () => {
      service.calculateAndBillUsage(
        'gpt-4o',
        { usage: mockTokenUsage },
        'workspace-1',
        'agent-id-123',
      );

      expect(
        mockWorkspaceEventEmitter.emitCustomBatchEvent,
      ).toHaveBeenCalledWith(
        BILLING_FEATURE_USED,
        [
          {
            eventName: BillingMeterEventName.WORKFLOW_NODE_RUN,
            value: 7500,
            dimensions: {
              execution_type: 'ai_token',
              resource_id: 'agent-id-123',
              execution_context_1: 'gpt-4o',
            },
          },
        ],
        'workspace-1',
      );
    });
  });
});
