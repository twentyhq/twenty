import {
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Test, type TestingModule } from '@nestjs/testing';

import { HealthController } from 'src/engine/core-modules/health/controllers/health.controller';

describe('HealthController', () => {
  let healthController: HealthController;
  let healthCheckService: HealthCheckService;
  let typeOrmHealthIndicator: TypeOrmHealthIndicator;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: { check: jest.fn() },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: { pingCheck: jest.fn() },
        },
      ],
    }).compile();

    healthController = testingModule.get<HealthController>(HealthController);
    healthCheckService =
      testingModule.get<HealthCheckService>(HealthCheckService);
    typeOrmHealthIndicator = testingModule.get<TypeOrmHealthIndicator>(
      TypeOrmHealthIndicator,
    );
  });

  it('should be defined', () => {
    expect(healthController).toBeDefined();
  });

  describe('check', () => {
    it('should verify database connectivity via TypeOrmHealthIndicator', async () => {
      const expectedResult = {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      };

      jest
        .spyOn(healthCheckService, 'check')
        .mockImplementation(async (indicators) => {
          for (const indicator of indicators) {
            await indicator();
          }

          return expectedResult as any;
        });

      jest.spyOn(typeOrmHealthIndicator, 'pingCheck').mockResolvedValue({
        database: { status: 'up' },
      });

      const result = await healthController.check();

      expect(healthCheckService.check).toHaveBeenCalledTimes(1);
      expect(typeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith('database');
      expect(result).toEqual(expectedResult);
    });

    it('should propagate health check failure when database is down', async () => {
      const errorResult = new Error('Database ping timeout');

      jest
        .spyOn(healthCheckService, 'check')
        .mockImplementation(async (indicators) => {
          await indicators[0]();
          throw errorResult;
        });

      jest
        .spyOn(typeOrmHealthIndicator, 'pingCheck')
        .mockRejectedValue(errorResult);

      await expect(healthController.check()).rejects.toThrow(
        'Database ping timeout',
      );
      expect(typeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith('database');
    });
  });
});
