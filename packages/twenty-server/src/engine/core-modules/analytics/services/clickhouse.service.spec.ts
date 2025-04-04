import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

import { ClickhouseService } from './clickhouse.service';

describe('ClickhouseService', () => {
  let service: ClickhouseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClickhouseService,
        {
          provide: EnvironmentService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClickhouseService>(ClickhouseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
