import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_INSTANCE_TOKEN } from 'src/engine/core-modules/twenty-config/constants/config-variables-instance-tokens.constants';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

describe('EnvironmentConfigDriver', () => {
  let driver: EnvironmentConfigDriver;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnvironmentConfigDriver,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: CONFIG_VARIABLES_INSTANCE_TOKEN,
          useValue: new ConfigVariables(),
        },
      ],
    }).compile();

    driver = module.get<EnvironmentConfigDriver>(EnvironmentConfigDriver);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(driver).toBeDefined();
  });

  describe('get', () => {
    it('should return value from config service when available', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const expectedValue = true;
      const defaultValue = new ConfigVariables()[key];

      jest.spyOn(configService, 'get').mockReturnValue(expectedValue);

      const result = driver.get(key);

      expect(result).toBe(expectedValue);
      expect(configService.get).toHaveBeenCalledWith(key, defaultValue);
    });

    it('should return default value when config service returns undefined', () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const defaultValue = new ConfigVariables()[key];

      jest
        .spyOn(configService, 'get')
        .mockImplementation((_, defaultVal) => defaultVal);

      const result = driver.get(key);

      expect(result).toBe(defaultValue);
      expect(configService.get).toHaveBeenCalledWith(key, defaultValue);
    });

    it('should handle different config variable types', () => {
      const booleanKey = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const stringKey = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;
      const numberKey = 'NODE_PORT' as keyof ConfigVariables;

      const defaultValues = new ConfigVariables();

      jest
        .spyOn(configService, 'get')
        .mockImplementation((key: keyof ConfigVariables) => {
          switch (key) {
            case booleanKey:
              return true;
            case stringKey:
              return 'test@example.com';
            case numberKey:
              return 3000;
            default:
              return undefined;
          }
        });

      expect(driver.get(booleanKey)).toBe(true);
      expect(configService.get).toHaveBeenCalledWith(
        booleanKey,
        defaultValues[booleanKey],
      );

      expect(driver.get(stringKey)).toBe('test@example.com');
      expect(configService.get).toHaveBeenCalledWith(
        stringKey,
        defaultValues[stringKey],
      );

      expect(driver.get(numberKey)).toBe(3000);
      expect(configService.get).toHaveBeenCalledWith(
        numberKey,
        defaultValues[numberKey],
      );
    });
  });
});
