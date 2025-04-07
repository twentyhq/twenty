import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerRegistry } from '@nestjs/schedule';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';

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
        {
          provide: ExceptionHandlerService,
          useValue: {
            captureExceptions: jest.fn(),
          },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            addInterval: jest.fn(),
            doesExist: jest.fn(),
            deleteInterval: jest.fn(),
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
