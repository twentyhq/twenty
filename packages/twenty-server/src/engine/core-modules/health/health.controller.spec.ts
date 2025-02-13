import { HealthCheckService } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';

import { HealthCacheService } from './health-cache.service';
import { HealthController } from './health.controller';

import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { WorkerHealthIndicator } from './indicators/worker.health';

describe('HealthController', () => {
  let healthController: HealthController;
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: { check: jest.fn() },
        },
        {
          provide: DatabaseHealthIndicator,
          useValue: { isHealthy: jest.fn() },
        },
        {
          provide: RedisHealthIndicator,
          useValue: { isHealthy: jest.fn() },
        },
        {
          provide: WorkerHealthIndicator,
          useValue: { isHealthy: jest.fn() },
        },
        {
          provide: HealthCacheService,
          useValue: {
            getMessageChannelSyncJobByStatusCounter: jest.fn(),
            getInvalidCaptchaCounter: jest.fn(),
            getSystemStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    healthController = testingModule.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(healthController).toBeDefined();
  });
});
