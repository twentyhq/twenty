import { Test, type TestingModule } from '@nestjs/testing';

import { AiService } from 'src/engine/core-modules/ai/services/ai.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { AIBillingService } from 'src/engine/core-modules/ai/services/ai-billing.service';

import { AiController } from './ai.controller';

describe('AiController', () => {
  let controller: AiController;
  let aiService: jest.Mocked<AiService>;
  let featureFlagService: jest.Mocked<FeatureFlagService>;
  let aiBillingService: jest.Mocked<AIBillingService>;

  beforeEach(async () => {
    const mockAiService = {
      streamText: jest.fn(),
      getModel: jest.fn(),
    } as Partial<jest.Mocked<AiService>>;

    const mockFeatureFlagService = {
      isFeatureEnabled: jest.fn().mockResolvedValue(true),
    } as Partial<jest.Mocked<FeatureFlagService>>;

    const mockAIBillingService = {
      calculateAndBillUsage: jest.fn(),
    } as Partial<jest.Mocked<AIBillingService>>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: mockAiService,
        },
        {
          provide: FeatureFlagService,
          useValue: mockFeatureFlagService,
        },
        {
          provide: AIBillingService,
          useValue: mockAIBillingService,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    aiService = module.get(AiService);
    featureFlagService = module.get(FeatureFlagService);
    aiBillingService = module.get(AIBillingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chat', () => {
    const mockWorkspace = { id: 'workspace-1' } as any;

    it('should handle valid chat request and bill usage', async () => {
      const mockRequest = {
        messages: [{ role: 'user' as const, content: 'Hello' }],
        temperature: 0.7,
        maxTokens: 100,
      };

      const mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as any;

      const mockModel = { modelId: 'gpt-4o' } as any;

      aiService.getModel.mockReturnValue(mockModel);

      const mockUsage = {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      };

      const mockStreamTextResult = {
        usage: Promise.resolve(mockUsage),
        pipeDataStreamToResponse: jest.fn(),
      };

      aiService.streamText.mockReturnValue(mockStreamTextResult as any);

      await controller.chat(mockRequest, mockWorkspace, mockRes);
      // Wait a microtask so the usage.then billing call fires
      await Promise.resolve();

      expect(featureFlagService.isFeatureEnabled).toHaveBeenCalled();
      expect(aiService.streamText).toHaveBeenCalledWith(mockRequest.messages, {
        temperature: 0.7,
        maxTokens: 100,
        model: mockModel,
      });
      expect(
        mockStreamTextResult.pipeDataStreamToResponse,
      ).toHaveBeenCalledWith(mockRes);
      expect(aiBillingService.calculateAndBillUsage).toHaveBeenCalledWith(
        mockModel.modelId,
        mockUsage,
        mockWorkspace.id,
      );
    });

    it('should throw error for empty messages', async () => {
      const mockRequest = {
        messages: [],
      };

      const mockRes = {} as any;

      await expect(
        controller.chat(mockRequest, mockWorkspace, mockRes),
      ).rejects.toThrow('Messages array is required and cannot be empty');

      expect(aiBillingService.calculateAndBillUsage).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const mockRequest = {
        messages: [{ role: 'user' as const, content: 'Hello' }],
      };

      const mockRes = {} as any;

      aiService.getModel.mockReturnValue({ modelId: 'gpt-4o' } as any);
      aiService.streamText.mockImplementation(() => {
        throw new Error('Service error');
      });

      await expect(
        controller.chat(mockRequest, mockWorkspace, mockRes),
      ).rejects.toThrow(
        'An error occurred while processing your request: Service error',
      );

      expect(aiBillingService.calculateAndBillUsage).not.toHaveBeenCalled();
    });

    it('should throw error when AI feature is disabled', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(false);

      const mockRequest = {
        messages: [{ role: 'user' as const, content: 'Hello' }],
      };

      const mockRes = {} as any;

      await expect(
        controller.chat(mockRequest, mockWorkspace, mockRes),
      ).rejects.toThrow('AI feature is not enabled for this workspace');

      expect(aiBillingService.calculateAndBillUsage).not.toHaveBeenCalled();
    });
  });
});
