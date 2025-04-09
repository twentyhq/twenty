import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('TwentyConfigService', () => {
  let service: TwentyConfigService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwentyConfigService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TwentyConfigService>(TwentyConfigService);
    configService = module.get<ConfigService>(ConfigService);

    Reflect.defineMetadata('config-variables', {}, ConfigVariables);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll()', () => {
    it('should return empty object when no config variables are defined', () => {
      const result = service.getAll();

      expect(result).toEqual({});
    });

    it('should return config variables with their metadata', () => {
      const mockMetadata = {
        TEST_VAR: {
          title: 'Test Var',
          description: 'Test Description',
        },
      };

      Reflect.defineMetadata('config-variables', mockMetadata, ConfigVariables);

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

      Reflect.defineMetadata('config-variables', mockMetadata, ConfigVariables);

      jest.spyOn(configService, 'get').mockReturnValue('super-secret-value');

      const result = service.getAll();

      expect(result.APP_SECRET.value).not.toBe('super-secret-value');
      expect(result.APP_SECRET.value).toMatch(/^\*+[a-zA-Z0-9]{5}$/);
    });
  });
});
