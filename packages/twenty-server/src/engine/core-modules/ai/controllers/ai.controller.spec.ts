import { Test, type TestingModule } from '@nestjs/testing';

import { openai } from '@ai-sdk/openai';

import { ModelProvider } from 'src/engine/core-modules/ai/constants/ai-models.const';
import { AIBillingService } from 'src/engine/core-modules/ai/services/ai-billing.service';
import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { AiService } from 'src/engine/core-modules/ai/services/ai.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

import { AiController } from './ai.controller';

describe('AiController', () => {
  let controller: AiController;
  let aiService: jest.Mocked<AiService>;
  let featureFlagService: jest.Mocked<FeatureFlagService>;
  let aiBillingService: jest.Mocked<AIBillingService>;
  let aiModelRegistryService: jest.Mocked<AiModelRegistryService>;

  beforeEach(async () => {
    const mockAiService = {
      streamText: jest.fn(),
      getModel: jest.fn(),
    };

    const mockFeatureFlagService = {
      isFeatureEnabled: jest.fn().mockResolvedValue(true),
    };

    const mockAIBillingService = {
      calculateAndBillUsage: jest.fn(),
    };

    const mockAiModelRegistryService = {
      getDefaultModel: jest.fn().mockReturnValue({
        modelId: 'gpt-4o',
        provider: ModelProvider.OPENAI,
        model: openai('gpt-4o'),
      }),
    };

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
        {
          provide: AiModelRegistryService,
          useValue: mockAiModelRegistryService,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    aiService = module.get(AiService);
    featureFlagService = module.get(FeatureFlagService);
    aiBillingService = module.get(AIBillingService);
    aiModelRegistryService = module.get(AiModelRegistryService);
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
        maxOutputTokens: 100,
      };

      const mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as any;

      const mockModel = openai('gpt-4o');

      aiModelRegistryService.getDefaultModel.mockReturnValue({
        modelId: 'gpt-4o',
        provider: ModelProvider.OPENAI,
        model: mockModel,
      });

      const mockUsage = {
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
      };

      const mockStreamTextResult = {
        usage: Promise.resolve(mockUsage),
        pipeUIMessageStreamToResponse: jest.fn(),
      };

      aiService.streamText.mockReturnValue(mockStreamTextResult as any);

      await controller.chat(mockRequest, mockWorkspace, mockRes);
      // Wait a microtask so the usage.then billing call fires
      await Promise.resolve();

      expect(featureFlagService.isFeatureEnabled).toHaveBeenCalled();
      expect(aiService.streamText).toHaveBeenCalledWith({
        messages: mockRequest.messages,
        options: {
          temperature: 0.7,
          maxOutputTokens: 100,
          model: mockModel,
        },
      });
      expect(
        mockStreamTextResult.pipeUIMessageStreamToResponse,
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

      aiModelRegistryService.getDefaultModel.mockReturnValue({
        modelId: 'gpt-4o',
        provider: ModelProvider.OPENAI,
        model: openai('gpt-4o'),
      });
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
