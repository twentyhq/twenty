import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HEALTH_INDICATORS_TIMEOUT } from 'src/engine/core-modules/health/constants/health-indicators-timeout.conts';
import { HealthCacheService } from 'src/engine/core-modules/health/health-cache.service';
import { MessageSyncHealthIndicator } from 'src/engine/core-modules/health/indicators/message-sync.health';
import { MessageChannelSyncStatus } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

describe('MessageSyncHealthIndicator', () => {
  let service: MessageSyncHealthIndicator;
  let healthCacheService: jest.Mocked<HealthCacheService>;
  let healthIndicatorService: jest.Mocked<HealthIndicatorService>;

  beforeEach(async () => {
    healthCacheService = {
      getMessageChannelSyncJobByStatusCounter: jest.fn(),
    } as any;

    healthIndicatorService = {
      check: jest.fn().mockReturnValue({
        up: jest.fn().mockImplementation((data) => ({
          messageSync: { status: 'up', ...data },
        })),
        down: jest.fn().mockImplementation((error) => ({
          messageSync: { status: 'down', error },
        })),
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageSyncHealthIndicator,
        {
          provide: HealthCacheService,
          useValue: healthCacheService,
        },
        {
          provide: HealthIndicatorService,
          useValue: healthIndicatorService,
        },
      ],
    }).compile();

    service = module.get<MessageSyncHealthIndicator>(
      MessageSyncHealthIndicator,
    );
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return up status when no jobs are present', async () => {
    healthCacheService.getMessageChannelSyncJobByStatusCounter.mockResolvedValue(
      {
        [MessageChannelSyncStatus.NOT_SYNCED]: 0,
        [MessageChannelSyncStatus.ONGOING]: 0,
        [MessageChannelSyncStatus.ACTIVE]: 0,
        [MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS]: 0,
        [MessageChannelSyncStatus.FAILED_UNKNOWN]: 0,
      },
    );

    const result = await service.isHealthy();

    expect(result.messageSync.status).toBe('up');
    expect(result.messageSync.details.totalJobs).toBe(0);
    expect(result.messageSync.details.failedJobs).toBe(0);
    expect(result.messageSync.details.failureRate).toBe(0);
  });

  it('should return up status when failure rate is below 20%', async () => {
    healthCacheService.getMessageChannelSyncJobByStatusCounter.mockResolvedValue(
      {
        [MessageChannelSyncStatus.NOT_SYNCED]: 0,
        [MessageChannelSyncStatus.ONGOING]: 2,
        [MessageChannelSyncStatus.ACTIVE]: 8,
        [MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS]: 0,
        [MessageChannelSyncStatus.FAILED_UNKNOWN]: 1,
      },
    );

    const result = await service.isHealthy();

    expect(result.messageSync.status).toBe('up');
    expect(result.messageSync.details.totalJobs).toBe(11);
    expect(result.messageSync.details.failedJobs).toBe(1);
    expect(result.messageSync.details.failureRate).toBe(9.09);
  });

  it('should return down status when failure rate is above 20%', async () => {
    healthCacheService.getMessageChannelSyncJobByStatusCounter.mockResolvedValue(
      {
        [MessageChannelSyncStatus.NOT_SYNCED]: 0,
        [MessageChannelSyncStatus.ONGOING]: 1,
        [MessageChannelSyncStatus.ACTIVE]: 1,
        [MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS]: 2,
        [MessageChannelSyncStatus.FAILED_UNKNOWN]: 2,
      },
    );

    const result = await service.isHealthy();

    expect(result.messageSync.status).toBe('down');
    expect(result.messageSync.error.error).toBe(
      HEALTH_ERROR_MESSAGES.MESSAGE_SYNC_HIGH_FAILURE_RATE,
    );
    expect(result.messageSync.error.details).toBeDefined();
    expect(result.messageSync.error.details.failureRate).toBe(33.33);
  });

  it('should timeout after specified duration', async () => {
    healthCacheService.getMessageChannelSyncJobByStatusCounter.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(resolve, HEALTH_INDICATORS_TIMEOUT + 100),
        ),
    );

    const healthCheckPromise = service.isHealthy();

    jest.advanceTimersByTime(HEALTH_INDICATORS_TIMEOUT + 1);

    const result = await healthCheckPromise;

    expect(result.messageSync.status).toBe('down');
    expect(result.messageSync.error).toBe(
      HEALTH_ERROR_MESSAGES.MESSAGE_SYNC_TIMEOUT,
    );
  });
});
