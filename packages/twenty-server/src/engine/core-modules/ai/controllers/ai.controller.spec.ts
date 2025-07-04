import { Test, TestingModule } from '@nestjs/testing';

import { AiService } from 'src/engine/core-modules/ai/services/ai.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';

import { AiController } from './ai.controller';

describe('AiController', () => {
  let controller: AiController;
  let aiService: jest.Mocked<AiService>;
  let featureFlagService: jest.Mocked<FeatureFlagService>;

  beforeEach(async () => {
    const mockAiService = {
      streamText: jest.fn(),
    };

    const mockFeatureFlagService = {
      isFeatureEnabled: jest.fn().mockResolvedValue(true),
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
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    aiService = module.get(AiService);
    featureFlagService = module.get(FeatureFlagService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('chat', () => {
    const mockWorkspace = { id: 'workspace-1' } as any;

    it('should handle valid chat request', async () => {
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

      const mockStreamTextResult = {
        pipeDataStreamToResponse: jest.fn(),
      };

      aiService.streamText.mockReturnValue(mockStreamTextResult as any);

      await controller.chat(mockRequest, mockWorkspace, mockRes);

      expect(featureFlagService.isFeatureEnabled).toHaveBeenCalled();
      expect(aiService.streamText).toHaveBeenCalledWith(mockRequest.messages, {
        temperature: 0.7,
        maxTokens: 100,
      });
      expect(
        mockStreamTextResult.pipeDataStreamToResponse,
      ).toHaveBeenCalledWith(mockRes);
    });

    it('should throw error for empty messages', async () => {
      const mockRequest = {
        messages: [],
      };

      const mockRes = {} as any;

      await expect(
        controller.chat(mockRequest, mockWorkspace, mockRes),
      ).rejects.toThrow('Messages array is required and cannot be empty');
    });

    it('should handle service errors', async () => {
      const mockRequest = {
        messages: [{ role: 'user' as const, content: 'Hello' }],
      };

      const mockRes = {} as any;

      aiService.streamText.mockImplementation(() => {
        throw new Error('Service error');
      });

      await expect(
        controller.chat(mockRequest, mockWorkspace, mockRes),
      ).rejects.toThrow(
        'An error occurred while processing your request: Service error',
      );
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
    });
  });
});
