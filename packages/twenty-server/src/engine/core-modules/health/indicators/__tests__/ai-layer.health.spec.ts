import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, type TestingModule } from '@nestjs/testing';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { AILayerHealthIndicator } from 'src/engine/core-modules/health/indicators/ai-layer.health';
import { AILayerService } from 'src/engine/core-modules/ai-layer/ai-layer.service';

describe('AILayerHealthIndicator', () => {
  let service: AILayerHealthIndicator;
  let mockAILayerService: jest.Mocked<AILayerService>;
  let healthIndicatorService: jest.Mocked<HealthIndicatorService>;

  beforeEach(async () => {
    mockAILayerService = {
      checkHealth: jest.fn(),
      reportError: jest.fn(),
      getContext: jest.fn(),
    } as unknown as jest.Mocked<AILayerService>;

    healthIndicatorService = {
      check: jest.fn().mockReturnValue({
        up: jest.fn().mockImplementation((data) => ({
          aiLayer: { status: 'up', ...data },
        })),
        down: jest.fn().mockImplementation((error) => ({
          aiLayer: {
            status: 'down',
            ...error,
          },
        })),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AILayerHealthIndicator,
        {
          provide: AILayerService,
          useValue: mockAILayerService,
        },
        {
          provide: HealthIndicatorService,
          useValue: healthIndicatorService,
        },
      ],
    }).compile();

    service = module.get<AILayerHealthIndicator>(AILayerHealthIndicator);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return up status when all AI Layer services respond', async () => {
    mockAILayerService.checkHealth.mockResolvedValueOnce({
      ctxMcp: true,
      kbMcp: true,
      n8n: true,
      timestamp: new Date(),
    });

    const result = await service.isHealthy();

    expect(result.aiLayer.status).toBe('up');
    expect(result.aiLayer.details).toBeDefined();
    expect(result.aiLayer.details.services).toEqual({
      ctxMcp: 'up',
      kbMcp: 'up',
      n8n: 'up',
    });
  });

  it('should return degraded status when some services are down', async () => {
    mockAILayerService.checkHealth.mockResolvedValueOnce({
      ctxMcp: true,
      kbMcp: false,
      n8n: true,
      timestamp: new Date(),
    });

    const result = await service.isHealthy();

    expect(result.aiLayer.status).toBe('up');
    expect(result.aiLayer.details.status).toBe('degraded');
    expect(result.aiLayer.details.services.kbMcp).toBe('down');
  });

  it('should return down status when all services fail', async () => {
    mockAILayerService.checkHealth.mockResolvedValueOnce({
      ctxMcp: false,
      kbMcp: false,
      n8n: false,
      timestamp: new Date(),
    });

    const result = await service.isHealthy();

    expect(result.aiLayer.status).toBe('down');
    expect(result.aiLayer.message).toBe(
      HEALTH_ERROR_MESSAGES.AI_LAYER_ALL_SERVICES_DOWN,
    );
  });

  it('should return down status when checkHealth throws', async () => {
    mockAILayerService.checkHealth.mockRejectedValueOnce(
      new Error('Connection refused'),
    );

    const result = await service.isHealthy();

    expect(result.aiLayer.status).toBe('down');
    expect(result.aiLayer.message).toBe(
      HEALTH_ERROR_MESSAGES.AI_LAYER_CONNECTION_FAILED,
    );
  });
});
