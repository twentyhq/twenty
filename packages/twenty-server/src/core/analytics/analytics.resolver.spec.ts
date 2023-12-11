import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

import { AnalyticsResolver } from './analytics.resolver';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsResolver', () => {
  let resolver: AnalyticsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsResolver,
        AnalyticsService,
        {
          provide: EnvironmentService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<AnalyticsResolver>(AnalyticsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
