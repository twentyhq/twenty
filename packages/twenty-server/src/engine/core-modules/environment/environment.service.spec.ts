import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { ENVIRONMENT_VARIABLES_METADATA_DECORATOR_KEY } from 'src/engine/core-modules/environment/constants/environment-variables-metadata-decorator-key';
import { ENVIRONMENT_VARIABLES_METADATA_DECORATOR_NAMES_KEY } from 'src/engine/core-modules/environment/constants/environment-variables-metadata-decorator-names-key';
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

    Reflect.defineMetadata(
      ENVIRONMENT_VARIABLES_METADATA_DECORATOR_NAMES_KEY,
      [],
      EnvironmentVariables,
    );
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
        title: 'Test Var',
        description: 'Test Description',
      };
      const mockVarNames = ['TEST_VAR'];

      Reflect.defineMetadata(
        ENVIRONMENT_VARIABLES_METADATA_DECORATOR_NAMES_KEY,
        mockVarNames,
        EnvironmentVariables,
      );

      Reflect.defineMetadata(
        ENVIRONMENT_VARIABLES_METADATA_DECORATOR_KEY,
        mockMetadata,
        EnvironmentVariables.prototype,
        'TEST_VAR',
      );

      jest.spyOn(configService, 'get').mockReturnValue('test-value');

      const result = service.getAll();

      expect(result).toEqual({
        TEST_VAR: {
          value: 'test-value',
          metadata: mockMetadata,
        },
      });
    });

    it('should mask sensitive data according to masking config', () => {
      const mockMetadata = {
        title: 'App Secret',
        description: 'Application secret key',
        sensitive: true,
      };
      const mockVarNames = ['APP_SECRET'];

      Reflect.defineMetadata(
        ENVIRONMENT_VARIABLES_METADATA_DECORATOR_NAMES_KEY,
        mockVarNames,
        EnvironmentVariables,
      );

      Reflect.defineMetadata(
        ENVIRONMENT_VARIABLES_METADATA_DECORATOR_KEY,
        mockMetadata,
        EnvironmentVariables.prototype,
        'APP_SECRET',
      );

      jest.spyOn(configService, 'get').mockReturnValue('super-secret-value');

      const result = service.getAll();

      expect(result.APP_SECRET.value).not.toBe('super-secret-value');
      expect(result.APP_SECRET.value).toMatch(/^\*+[a-zA-Z0-9]{5}$/);
    });

    it('should use default value when environment variable is not set', () => {
      const mockMetadata = {
        title: 'Debug Port',
        description: 'Debug port number',
      };
      const mockVarNames = ['DEBUG_PORT'];

      Reflect.defineMetadata(
        ENVIRONMENT_VARIABLES_METADATA_DECORATOR_NAMES_KEY,
        mockVarNames,
        EnvironmentVariables,
      );

      Reflect.defineMetadata(
        ENVIRONMENT_VARIABLES_METADATA_DECORATOR_KEY,
        mockMetadata,
        EnvironmentVariables.prototype,
        'DEBUG_PORT',
      );

      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      const result = service.getAll();

      expect(result.DEBUG_PORT.value).toBe(9000);
    });
  });
});
