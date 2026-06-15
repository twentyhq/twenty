import { Test, type TestingModule } from '@nestjs/testing';

import { LOGGER_DRIVER } from 'src/engine/core-modules/logger/logger.constants';
import { LoggerService } from 'src/engine/core-modules/logger/logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  const driver = { log: jest.fn(), options: { logLevels: [] as string[] } };

  beforeEach(async () => {
    jest.clearAllMocks();
    driver.options.logLevels = ['log', 'error', 'warn'];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        {
          provide: LOGGER_DRIVER,
          useValue: driver,
        },
      ],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('perf', () => {
    it('should log through the driver when the performance level is enabled', () => {
      driver.options.logLevels = ['log', 'performance'];

      service.perf('message', 'Category');

      expect(driver.log).toHaveBeenCalledWith('message', 'Category');
    });

    it('should not log when the performance level is disabled', () => {
      driver.options.logLevels = ['log', 'error', 'warn'];

      service.perf('message', 'Category');

      expect(driver.log).not.toHaveBeenCalled();
    });
  });

  describe('perfTime / perfTimeEnd', () => {
    it('should log the elapsed duration when the performance level is enabled', () => {
      driver.options.logLevels = ['performance'];

      service.perfTime('Category', 'label');
      service.perfTimeEnd('Category', 'label');

      expect(driver.log).toHaveBeenCalledTimes(1);
      expect(driver.log).toHaveBeenCalledWith(
        expect.stringMatching(/^label: [\d.]+ms$/),
        'Category',
      );
    });

    it('should not log when the performance level is disabled', () => {
      driver.options.logLevels = ['log'];

      service.perfTime('Category', 'label');
      service.perfTimeEnd('Category', 'label');

      expect(driver.log).not.toHaveBeenCalled();
    });
  });
});
