import { Test, type TestingModule } from '@nestjs/testing';

import { LOGGER_DRIVER } from 'src/engine/core-modules/logger/logger.constants';
import { LoggerService } from 'src/engine/core-modules/logger/logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: LOGGER_DRIVER,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
