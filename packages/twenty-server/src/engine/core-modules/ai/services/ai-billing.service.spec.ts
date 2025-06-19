import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AIModel,
  ModelProvider,
} from 'src/engine/core-modules/ai/entities/ai-model.entity';
import { BILLING_FEATURE_USED } from 'src/engine/core-modules/billing/constants/billing-feature-used.constant';
import { BillingMeterEventName } from 'src/engine/core-modules/billing/enums/billing-meter-event-names';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

import { AIBillingService } from './ai-billing.service';

describe('AIBillingService', () => {
  let service: AIBillingService;
  let mockRepository: jest.Mocked<Repository<AIModel>>;
  let mockWorkspaceEventEmitter: jest.Mocked<WorkspaceEventEmitter>;

  const mockModel: AIModel = {
    modelId: 'gpt-4',
    displayName: 'GPT-4',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 30,
    outputCostPer1kTokensInCents: 60,
    isActive: true,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokenUsage = {
    promptTokens: 1000,
    completionTokens: 500,
    totalTokens: 1500,
  };

  const mockCostInCents = 60; // (1000/1000 * 30) + (500/1000 * 60) = 30 + 30 = 60

  beforeEach(async () => {
    const mockRepositoryMethods = {
      findOne: jest.fn(),
    };

    const mockEventEmitterMethods = {
      emitCustomBatchEvent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIBillingService,
        {
          provide: getRepositoryToken(AIModel, 'core'),
          useValue: mockRepositoryMethods,
        },
        {
          provide: WorkspaceEventEmitter,
          useValue: mockEventEmitterMethods,
        },
      ],
    }).compile();

    service = module.get<AIBillingService>(AIBillingService);
    mockRepository = module.get(getRepositoryToken(AIModel, 'core'));
    mockWorkspaceEventEmitter = module.get(WorkspaceEventEmitter);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCost', () => {
    it('should calculate cost correctly for valid model and token usage', async () => {
      mockRepository.findOne.mockResolvedValue(mockModel);

      const result = await service.calculateCost('gpt-4', mockTokenUsage);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { modelId: 'gpt-4', isActive: true },
      });
      expect(result).toEqual(mockCostInCents);
    });

    it('should return null for non-existent model', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.calculateCost(
        'non-existent',
        mockTokenUsage,
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { modelId: 'non-existent', isActive: true },
      });
      expect(result).toBeNull();
    });

    it('should calculate cost correctly with different token usage', async () => {
      const differentTokenUsage = {
        promptTokens: 2000,
        completionTokens: 1000,
        totalTokens: 3000,
      };

      mockRepository.findOne.mockResolvedValue(mockModel);

      const result = await service.calculateCost('gpt-4', differentTokenUsage);

      // Expected: (2000/1000 * 30) + (1000/1000 * 60) = 60 + 60 = 120
      expect(result).toEqual(120);
    });
  });

  describe('calculateAndBillUsage', () => {
    it('should calculate cost and emit billing event when model exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockModel);

      await service.calculateAndBillUsage(
        'gpt-4',
        mockTokenUsage,
        'workspace-1',
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { modelId: 'gpt-4', isActive: true },
      });

      // Expected credits: (60 cents / 100) * 1000 = 0.6 * 1000 = 600 credits
      expect(
        mockWorkspaceEventEmitter.emitCustomBatchEvent,
      ).toHaveBeenCalledWith(
        BILLING_FEATURE_USED,
        [
          {
            eventName: BillingMeterEventName.AI_TOKEN_USAGE,
            value: 600,
          },
        ],
        'workspace-1',
      );
    });

    it('should not emit billing event when model does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await service.calculateAndBillUsage(
        'non-existent',
        mockTokenUsage,
        'workspace-1',
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { modelId: 'non-existent', isActive: true },
      });
      expect(
        mockWorkspaceEventEmitter.emitCustomBatchEvent,
      ).not.toHaveBeenCalled();
    });
  });
});
