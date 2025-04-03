import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { ClickhouseService } from 'src/engine/core-modules/analytics/services/clickhouse.service';

import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: EnvironmentService,
          useValue: {},
        },
        {
          provide: ClickhouseService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
