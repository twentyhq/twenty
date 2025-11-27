import { Test, type TestingModule } from '@nestjs/testing';

import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { AIBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

describe('AIBillingService', () => {
  let service: AIBillingService;
  let mockWorkspaceEventEmitter: jest.Mocked<WorkspaceEventEmitter>;

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
      getEffectiveModelConfig: jest.fn().mockReturnValue({
        modelId: 'gpt-4o',
        label: 'GPT-4o',
        provider: 'openai',
        inputCostPer1kTokensInCents: 0.25,
        outputCostPer1kTokensInCents: 1.0,
      }),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCost', () => {
    it('should calculate cost correctly for valid model and token usage', async () => {
      const costInCents = await service.calculateCost('gpt-4o', mockTokenUsage);

      // Expected: (1000/1000 * 0.25) + (500/1000 * 1.0) = 0.25 + 0.5 = 0.75 cents
      expect(costInCents).toBe(0.75);
    });

    it('should calculate cost correctly with different token usage', async () => {
      const differentTokenUsage = {
        inputTokens: 2000,
        outputTokens: 1000,
        totalTokens: 3000,
      };

      const costInCents = await service.calculateCost(
        'gpt-4o',
        differentTokenUsage,
      );

      // Expected: (2000/1000 * 0.25) + (1000/1000 * 1.0) = 0.5 + 1.0 = 1.5 cents
      expect(costInCents).toBe(1.5);
    });
  });

  describe('calculateAndBillUsage', () => {
    it('should calculate cost and emit billing event when model exists', async () => {
      await service.calculateAndBillUsage(
        'gpt-4o',
        mockTokenUsage,
        'workspace-1',
        'agent-id-123',
      );

      // Expected credits: (0.75 cents / 100) * 1000 = 0.0075 * 1000 = 7.5 credits, rounded to 8
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
