import { Test, TestingModule } from '@nestjs/testing';

import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

import { AIBillingService } from './ai-billing.service';

describe('AIBillingService', () => {
  let service: AIBillingService;
  let mockWorkspaceEventEmitter: jest.Mocked<WorkspaceEventEmitter>;

  const mockTokenUsage = {
    promptTokens: 1000,
    completionTokens: 500,
    totalTokens: 1500,
  };

  beforeEach(async () => {
    const mockEventEmitterMethods = {
      emitCustomBatchEvent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIBillingService,
        {
          provide: WorkspaceEventEmitter,
          useValue: mockEventEmitterMethods,
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
      const result = await service.calculateCost('gpt-4o', mockTokenUsage);

      // Expected: (1000/1000 * 0.25) + (500/1000 * 1.0) = 0.25 + 0.5 = 0.75 cents
      expect(result.costInCents).toBe(0.75);
      expect(result.model.modelId).toBe('gpt-4o');
      expect(result.model.displayName).toBe('GPT-4o');
    });

    it('should throw error for non-existent model', async () => {
      await expect(
        service.calculateCost('non-existent', mockTokenUsage),
      ).rejects.toThrow('AI model with id non-existent not found');
    });

    it('should calculate cost correctly with different token usage', async () => {
      const differentTokenUsage = {
        promptTokens: 2000,
        completionTokens: 1000,
        totalTokens: 3000,
      };

      const result = await service.calculateCost('gpt-4o', differentTokenUsage);

      // Expected: (2000/1000 * 0.25) + (1000/1000 * 1.0) = 0.5 + 1.0 = 1.5 cents
      expect(result.costInCents).toBe(1.5);
    });
  });

  describe('calculateAndBillUsage', () => {
    it('should calculate cost and emit billing event when model exists', async () => {
      await service.calculateAndBillUsage(
        'gpt-4o',
        mockTokenUsage,
        'workspace-1',
      );

      // Expected credits: (0.75 cents / 100) * 1000 = 0.0075 * 1000 = 7.5 credits, rounded to 8
      expect(
        mockWorkspaceEventEmitter.emitCustomBatchEvent,
      ).toHaveBeenCalledWith(
        BILLING_FEATURE_USED,
        [
          {
            eventName: BillingMeterEventName.WORKFLOW_NODE_RUN,
            value: 8,
          },
        ],
        'workspace-1',
      );
    });

    it('should throw error when model does not exist', async () => {
      await expect(
        service.calculateAndBillUsage(
          'non-existent',
          mockTokenUsage,
          'workspace-1',
        ),
      ).rejects.toThrow('AI model with id non-existent not found');

      expect(
        mockWorkspaceEventEmitter.emitCustomBatchEvent,
      ).not.toHaveBeenCalled();
    });
  });
});
