import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';

import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_INSTANCE_TOKEN } from 'src/engine/core-modules/twenty-config/constants/config-variables-instance-tokens.constants';
import { DatabaseConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/database-config.driver';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { ConfigSource } from 'src/engine/core-modules/twenty-config/enums/config-source.enum';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { isEnvOnlyConfigVar } from 'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util';
import { TypedReflect } from 'src/utils/typed-reflect';

jest.mock('src/utils/typed-reflect', () => ({
  TypedReflect: {
    getMetadata: jest.fn(),
    defineMetadata: jest.fn(),
  },
}));

jest.mock(
  'src/engine/core-modules/twenty-config/constants/config-variables-masking-config',
  () => ({
    CONFIG_VARIABLES_MASKING_CONFIG: {
      SENSITIVE_VAR: {
        strategy: 'LAST_N_CHARS',
        chars: 5,
      },
    },
  }),
);

jest.mock(
  'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util',
  () => ({
    isEnvOnlyConfigVar: jest.fn(),
  }),
);

type TwentyConfigServicePrivateProps = {
  isDatabaseDriverActive: boolean;
};

const mockConfigVarMetadata = {
  TEST_VAR: {
    group: ConfigVariablesGroup.GOOGLE_AUTH,
    description: 'Test variable',
    isEnvOnly: false,
  },
  ENV_ONLY_VAR: {
    group: ConfigVariablesGroup.STORAGE_CONFIG,
    description: 'Environment only variable',
    isEnvOnly: true,
  },
  SENSITIVE_VAR: {
    group: ConfigVariablesGroup.LOGGING,
    description: 'Sensitive variable',
    isSensitive: true,
  },
};

const setupTestModule = async (isDatabaseConfigEnabled = true) => {
  const configServiceMock = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'IS_CONFIG_VARIABLES_IN_DB_ENABLED') {
        return isDatabaseConfigEnabled ? 'true' : 'false';
      }

      return undefined;
    }),
  };

  const mockConfigVariablesInstance = {
    TEST_VAR: 'test value',
    ENV_ONLY_VAR: 'env only value',
    SENSITIVE_VAR: 'sensitive value',
    NO_METADATA_KEY: 'value without metadata',
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      TwentyConfigService,
      {
        provide: DatabaseConfigDriver,
        useValue: {
          get: jest.fn(),
          set: jest.fn(),
          update: jest.fn(),
          getCacheInfo: jest.fn(),
          delete: jest.fn(),
        },
      },
      {
        provide: EnvironmentConfigDriver,
        useValue: {
          get: jest.fn().mockImplementation((key) => {
            return configServiceMock.get(key);
          }),
        },
      },
      {
        provide: ConfigService,
        useValue: configServiceMock,
      },
      {
        provide: CONFIG_VARIABLES_INSTANCE_TOKEN,
        useValue: mockConfigVariablesInstance,
      },
    ],
  }).compile();

  return {
    service: module.get<TwentyConfigService>(TwentyConfigService),
    databaseConfigDriver:
      module.get<DatabaseConfigDriver>(DatabaseConfigDriver),
    environmentConfigDriver: module.get<EnvironmentConfigDriver>(
      EnvironmentConfigDriver,
    ),
    configService: module.get<ConfigService>(ConfigService),
    configVariablesInstance: module.get(CONFIG_VARIABLES_INSTANCE_TOKEN),
  };
};

const setupTestModuleWithoutDb = async () => {
  const configServiceMock = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'IS_CONFIG_VARIABLES_IN_DB_ENABLED') {
        return 'false';
      }

      return undefined;
    }),
  };

  const mockConfigVariablesInstance = {
    TEST_VAR: 'test value',
    ENV_ONLY_VAR: 'env only value',
    SENSITIVE_VAR: 'sensitive value',
    NO_METADATA_KEY: 'value without metadata',
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      TwentyConfigService,
      {
        provide: EnvironmentConfigDriver,
        useValue: {
          get: jest.fn().mockImplementation((key) => {
            return configServiceMock.get(key);
          }),
        },
      },
      {
        provide: ConfigService,
        useValue: configServiceMock,
      },
      {
        provide: CONFIG_VARIABLES_INSTANCE_TOKEN,
        useValue: mockConfigVariablesInstance,
      },
    ],
  }).compile();

  return {
    service: module.get<TwentyConfigService>(TwentyConfigService),
    environmentConfigDriver: module.get<EnvironmentConfigDriver>(
      EnvironmentConfigDriver,
    ),
    configService: module.get<ConfigService>(ConfigService),
    configVariablesInstance: module.get(CONFIG_VARIABLES_INSTANCE_TOKEN),
  };
};

const setPrivateProps = (
  service: TwentyConfigService,
  props: Partial<TwentyConfigServicePrivateProps>,
) => {
  Object.entries(props).forEach(([key, value]) => {
    Object.defineProperty(service, key, {
      value,
      writable: true,
    });
  });
};

describe('TwentyConfigService', () => {
  let service: TwentyConfigService;
  let databaseConfigDriver: DatabaseConfigDriver;
  let environmentConfigDriver: EnvironmentConfigDriver;

  beforeEach(async () => {
    const testModule = await setupTestModule(true);

    service = testModule.service;
    databaseConfigDriver = testModule.databaseConfigDriver;
    environmentConfigDriver = testModule.environmentConfigDriver;

    (TypedReflect.getMetadata as jest.Mock).mockReturnValue(
      mockConfigVarMetadata,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should set isDatabaseDriverActive to false when database config is disabled', async () => {
      const { service, environmentConfigDriver } =
        await setupTestModuleWithoutDb();

      expect(environmentConfigDriver.get).toHaveBeenCalledWith(
        'IS_CONFIG_VARIABLES_IN_DB_ENABLED',
      );

      expect(service.getCacheInfo().usingDatabaseDriver).toBe(false);
    });

    it('should set isDatabaseDriverActive to true when database config is enabled and driver is available', async () => {
      const { service, environmentConfigDriver } = await setupTestModule(true);

      expect(environmentConfigDriver.get).toHaveBeenCalledWith(
        'IS_CONFIG_VARIABLES_IN_DB_ENABLED',
      );

      expect(service.getCacheInfo().usingDatabaseDriver).toBe(true);
    });
  });

  describe('get', () => {
    const key = 'TEST_VAR' as keyof ConfigVariables;
    const expectedValue = 'test value';

    beforeEach(() => {
      (isEnvOnlyConfigVar as jest.Mock).mockReturnValue(false);
    });

    it('should use environment driver for environment-only variables', () => {
      (isEnvOnlyConfigVar as jest.Mock).mockReturnValue(true);
      jest.spyOn(environmentConfigDriver, 'get').mockReturnValue(expectedValue);

      const result = service.get(key);

      expect(result).toBe(expectedValue);
      expect(environmentConfigDriver.get).toHaveBeenCalledWith(key);
    });

    it('should return undefined when key does not exist in any driver', () => {
      const nonExistentKey = 'NON_EXISTENT_KEY' as keyof ConfigVariables;

      jest.spyOn(databaseConfigDriver, 'get').mockReturnValue(undefined);
      jest.spyOn(environmentConfigDriver, 'get').mockReturnValue(undefined);
      setPrivateProps(service, { isDatabaseDriverActive: true });

      const result = service.get(nonExistentKey);

      expect(result).toBeUndefined();
      expect(databaseConfigDriver.get).toHaveBeenCalledWith(nonExistentKey);
      expect(environmentConfigDriver.get).toHaveBeenCalledWith(nonExistentKey);
    });

    it('should use database driver when isDatabaseDriverActive is true and value is found', () => {
      jest.spyOn(databaseConfigDriver, 'get').mockReturnValue(expectedValue);
      setPrivateProps(service, { isDatabaseDriverActive: true });

      jest.clearAllMocks();

      const result = service.get(key);

      expect(result).toBe(expectedValue);
      expect(databaseConfigDriver.get).toHaveBeenCalledWith(key);
      expect(environmentConfigDriver.get).not.toHaveBeenCalled();
    });

    it('should fall back to environment driver when database driver is active but value is not found', () => {
      const envValue = 'env value';

      jest.spyOn(databaseConfigDriver, 'get').mockReturnValue(undefined);
      jest.spyOn(environmentConfigDriver, 'get').mockReturnValue(envValue);
      setPrivateProps(service, { isDatabaseDriverActive: true });

      const result = service.get(key);

      expect(result).toBe(envValue);
      expect(databaseConfigDriver.get).toHaveBeenCalledWith(key);
      expect(environmentConfigDriver.get).toHaveBeenCalledWith(key);
    });

    it('should use environment driver when isDatabaseDriverActive is false', () => {
      jest.spyOn(environmentConfigDriver, 'get').mockReturnValue(expectedValue);
      setPrivateProps(service, { isDatabaseDriverActive: false });

      const result = service.get(key);

      expect(result).toBe(expectedValue);
      expect(environmentConfigDriver.get).toHaveBeenCalledWith(key);
      expect(databaseConfigDriver.get).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest.spyOn(service, 'validateConfigVariableExists').mockReturnValue(true);
    });

    it('should throw error when database driver is not active', async () => {
      setPrivateProps(service, { isDatabaseDriverActive: false });

      await expect(
        service.update('TEST_VAR' as keyof ConfigVariables, 'new value'),
      ).rejects.toThrow(
        'Database configuration is disabled or unavailable, cannot update configuration',
      );
    });

    it('should throw error when updating environment-only variable', async () => {
      setPrivateProps(service, { isDatabaseDriverActive: true });
      (TypedReflect.getMetadata as jest.Mock).mockReturnValue({
        ENV_ONLY_VAR: { isEnvOnly: true },
      });

      await expect(
        service.update('ENV_ONLY_VAR' as keyof ConfigVariables, 'new value'),
      ).rejects.toThrow(
        'Cannot update environment-only variable: ENV_ONLY_VAR',
      );
    });

    it('should update config when database driver is active', async () => {
      const key = 'TEST_VAR' as keyof ConfigVariables;
      const newValue = 'new value';

      setPrivateProps(service, { isDatabaseDriverActive: true });
      jest.spyOn(databaseConfigDriver, 'update').mockResolvedValue(undefined);

      await service.update(key, newValue);

      expect(databaseConfigDriver.update).toHaveBeenCalledWith(key, newValue);
    });

    it('should propagate errors from database driver', async () => {
      const error = new Error('Database error');

      setPrivateProps(service, { isDatabaseDriverActive: true });
      jest.spyOn(databaseConfigDriver, 'update').mockRejectedValue(error);

      await expect(
        service.update('TEST_VAR' as keyof ConfigVariables, 'new value'),
      ).rejects.toThrow(error);
    });
  });

  describe('getMetadata', () => {
    it('should return metadata for a config variable', () => {
      const result = service.getMetadata('TEST_VAR' as keyof ConfigVariables);

      expect(result).toEqual(mockConfigVarMetadata.TEST_VAR);
    });

    it('should return undefined when metadata does not exist', () => {
      const result = service.getMetadata(
        'UNKNOWN_VAR' as keyof ConfigVariables,
      );

      expect(result).toBeUndefined();
    });
  });

  describe('getAll', () => {
    const setupDriverMocks = () => {
      jest
        .spyOn(environmentConfigDriver, 'get')
        .mockImplementation((key: keyof ConfigVariables) => {
          const keyStr = String(key);
          const values = {
            TEST_VAR: 'env test value',
            ENV_ONLY_VAR: 'env only value',
            SENSITIVE_VAR: 'sensitive_data_123',
          };

          // @ts-expect-error legacy noImplicitAny
          return values[keyStr] || undefined;
        });

      jest
        .spyOn(databaseConfigDriver, 'get')
        .mockImplementation((key: keyof ConfigVariables) => {
          const keyStr = String(key);

          // @ts-expect-error legacy noImplicitAny
          if (mockConfigVarMetadata[keyStr]?.isEnvOnly) {
            return environmentConfigDriver.get(key);
          }
          const values = {
            TEST_VAR: 'db test value',
            SENSITIVE_VAR: 'sensitive_data_123',
          };

          // @ts-expect-error legacy noImplicitAny
          return values[keyStr] || undefined;
        });
    };

    beforeEach(() => {
      setupDriverMocks();
    });

    it('should return all config variables with environment source when database driver is not active', () => {
      setPrivateProps(service, {
        isDatabaseDriverActive: false,
      });

      const result = service.getAll();

      expect(result).toEqual({
        TEST_VAR: {
          value: 'env test value',
          metadata: mockConfigVarMetadata.TEST_VAR,
          source: ConfigSource.ENVIRONMENT,
        },
        ENV_ONLY_VAR: {
          value: 'env only value',
          metadata: mockConfigVarMetadata.ENV_ONLY_VAR,
          source: ConfigSource.ENVIRONMENT,
        },
        SENSITIVE_VAR: {
          value: expect.any(String),
          metadata: mockConfigVarMetadata.SENSITIVE_VAR,
          source: ConfigSource.ENVIRONMENT,
        },
      });

      expect(result.SENSITIVE_VAR.value).toBe('********a_123');
    });

    it('should return config variables with database source when database driver is active', () => {
      setPrivateProps(service, {
        isDatabaseDriverActive: true,
      });

      const result = service.getAll();

      expect(result.TEST_VAR).toEqual({
        value: 'db test value',
        metadata: mockConfigVarMetadata.TEST_VAR,
        source: ConfigSource.DATABASE,
      });

      expect(result.ENV_ONLY_VAR).toEqual({
        value: 'env only value',
        metadata: mockConfigVarMetadata.ENV_ONLY_VAR,
        source: ConfigSource.ENVIRONMENT,
      });

      expect(result.SENSITIVE_VAR).toEqual({
        value: '********a_123',
        metadata: mockConfigVarMetadata.SENSITIVE_VAR,
        source: ConfigSource.DATABASE,
      });
    });
  });

  describe('getCacheInfo', () => {
    it('should return basic info when database driver is not active', () => {
      setPrivateProps(service, {
        isDatabaseDriverActive: false,
      });

      const result = service.getCacheInfo();

      expect(result).toEqual({
        usingDatabaseDriver: false,
      });
    });

    it('should return cache stats when database driver is active', () => {
      const cacheStats = {
        foundConfigValues: 2,
        knownMissingKeys: 1,
        cacheKeys: ['TEST_VAR', 'SENSITIVE_VAR'],
      };

      setPrivateProps(service, {
        isDatabaseDriverActive: true,
      });

      jest
        .spyOn(databaseConfigDriver, 'getCacheInfo')
        .mockReturnValue(cacheStats);

      const result = service.getCacheInfo();

      expect(result).toEqual({
        usingDatabaseDriver: true,
        cacheStats,
      });
    });
  });

  describe('validateConfigVariableExists', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should be called by set, update, and delete methods', async () => {
      const validateSpy = jest
        .spyOn(service, 'validateConfigVariableExists')
        .mockReturnValue(true);

      setPrivateProps(service, { isDatabaseDriverActive: true });
      jest
        .spyOn(service as any, 'validateNotEnvOnly')
        .mockImplementation(() => {});

      await service.set('TEST_VAR' as keyof ConfigVariables, 'test value');
      await service.update(
        'TEST_VAR' as keyof ConfigVariables,
        'updated value',
      );
      await service.delete('TEST_VAR' as keyof ConfigVariables);

      expect(validateSpy).toHaveBeenCalledTimes(3);
      expect(validateSpy).toHaveBeenCalledWith('TEST_VAR');
    });

    it('should return true for valid config variables with metadata', () => {
      jest.spyOn(service, 'validateConfigVariableExists').mockRestore();

      jest
        .spyOn(service as any, 'getMetadata')
        .mockReturnValue(mockConfigVarMetadata.TEST_VAR);

      expect(service.validateConfigVariableExists('TEST_VAR')).toBe(true);
    });

    it('should throw error when config variable does not exist', () => {
      jest.spyOn(service, 'validateConfigVariableExists').mockRestore();

      expect(() => {
        service.validateConfigVariableExists('MISSING_KEY');
      }).toThrow(
        'Config variable "MISSING_KEY" does not exist in ConfigVariables',
      );
    });
  });
});
