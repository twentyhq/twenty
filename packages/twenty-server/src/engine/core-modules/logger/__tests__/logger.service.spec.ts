import { Test, type TestingModule } from '@nestjs/testing';

import { LOGGER_DRIVER } from 'src/engine/core-modules/logger/logger.constants';
import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('LoggerService', () => {
  let service: LoggerService;
  const driver = { log: jest.fn() };
  const get = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: LOGGER_DRIVER,
          useValue: driver,
        },
        {
          provide: TwentyConfigService,
          useValue: { get },
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('perf', () => {
    it('should log through the driver when PERF_LOG_ENABLED is true', () => {
      get.mockReturnValue(true);

      service.perf('message', 'Category');

      expect(driver.log).toHaveBeenCalledWith('message', 'Category');
    });

    it('should not log when PERF_LOG_ENABLED is false', () => {
      get.mockReturnValue(false);

      service.perf('message', 'Category');

      expect(driver.log).not.toHaveBeenCalled();
    });
  });

  describe('perfTime / perfTimeEnd', () => {
    it('should log the elapsed duration for a started span when enabled', () => {
      get.mockReturnValue(true);

      service.perfTime('Category', 'label');
      service.perfTimeEnd('Category', 'label');

      expect(driver.log).toHaveBeenCalledTimes(1);
      expect(driver.log).toHaveBeenCalledWith(
        expect.stringMatching(/^label: [\d.]+ms$/),
        'Category',
      );
    });

    it('should not log when PERF_LOG_ENABLED is false', () => {
      get.mockReturnValue(false);

      service.perfTime('Category', 'label');
      service.perfTimeEnd('Category', 'label');

      expect(driver.log).not.toHaveBeenCalled();
    });
  });
});
