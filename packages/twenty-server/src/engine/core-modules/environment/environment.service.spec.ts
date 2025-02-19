import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentVariables } from 'src/engine/core-modules/environment/environment-variables';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

describe('EnvironmentService', () => {
  let service: EnvironmentService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnvironmentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EnvironmentService>(EnvironmentService);
    configService = module.get<ConfigService>(ConfigService);

    Reflect.defineMetadata('environment-variables', {}, EnvironmentVariables);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll()', () => {
    it('should return empty object when no environment variables are defined', () => {
      const result = service.getAll();

      expect(result).toEqual({});
    });

    it('should return environment variables with their metadata', () => {
      const mockMetadata = {
        TEST_VAR: {
          title: 'Test Var',
          description: 'Test Description',
        },
      };

      Reflect.defineMetadata(
        'environment-variables',
        mockMetadata,
        EnvironmentVariables,
      );

      jest.spyOn(configService, 'get').mockReturnValue('test-value');

      const result = service.getAll();

      expect(result).toEqual({
        TEST_VAR: {
          value: 'test-value',
          metadata: mockMetadata.TEST_VAR,
        },
      });
    });

    it('should mask sensitive data according to masking config', () => {
      const mockMetadata = {
        APP_SECRET: {
          title: 'App Secret',
          description: 'Application secret key',
          sensitive: true,
        },
      };

      Reflect.defineMetadata(
        'environment-variables',
        mockMetadata,
        EnvironmentVariables,
      );

      jest.spyOn(configService, 'get').mockReturnValue('super-secret-value');

      const result = service.getAll();

      expect(result.APP_SECRET.value).not.toBe('super-secret-value');
      expect(result.APP_SECRET.value).toMatch(/^\*+[a-zA-Z0-9]{5}$/);
    });
  });
});
