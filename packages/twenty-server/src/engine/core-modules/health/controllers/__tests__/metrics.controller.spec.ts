import { Test, TestingModule } from '@nestjs/testing';

import { MetricsController } from 'src/engine/core-modules/health/controllers/metrics.controller';
import { HealthCacheService } from 'src/engine/core-modules/health/health-cache.service';

describe('MetricsController', () => {
  let metricsController: MetricsController;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: HealthCacheService,
          useValue: {
            getMessageChannelSyncJobByStatusCounter: jest.fn(),
            getCalendarChannelSyncJobByStatusCounter: jest.fn(),
            getInvalidCaptchaCounter: jest.fn(),
          },
        },
      ],
    }).compile();

    metricsController = testingModule.get<MetricsController>(MetricsController);
  });

  it('should be defined', () => {
    expect(metricsController).toBeDefined();
  });
});
