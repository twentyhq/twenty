import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { DatabaseConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/database-config.driver';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { ConfigInitializationState } from 'src/engine/core-modules/twenty-config/enums/config-initialization-state.enum';
import { ConfigSource } from 'src/engine/core-modules/twenty-config/enums/config-source.enum';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
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

type TwentyConfigServicePrivateProps = {
  driver: DatabaseConfigDriver | EnvironmentConfigDriver;
  isConfigVarInDbEnabled: boolean;
  configInitializationState: ConfigInitializationState;
};

const mockConfigVarMetadata = {
  TEST_VAR: {
    group: ConfigVariablesGroup.GoogleAuth,
    description: 'Test variable',
    isEnvOnly: false,
  },
  ENV_ONLY_VAR: {
    group: ConfigVariablesGroup.StorageConfig,
    description: 'Environment only variable',
    isEnvOnly: true,
  },
  SENSITIVE_VAR: {
    group: ConfigVariablesGroup.Logging,
    description: 'Sensitive variable',
    isSensitive: true,
  },
};

const setupTestModule = async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      TwentyConfigService,
      {
        provide: ConfigService,
        useValue: {
          get: jest.fn(),
        },
      },
      {
        provide: DatabaseConfigDriver,
        useValue: {
          initialize: jest.fn().mockResolvedValue(undefined),
          get: jest.fn(),
          update: jest.fn(),
          getCacheInfo: jest.fn(),
        },
      },
      {
        provide: EnvironmentConfigDriver,
        useValue: {
          get: jest.fn(),
        },
      },
    ],
  }).compile();

  return {
    service: module.get<TwentyConfigService>(TwentyConfigService),
    configService: module.get<ConfigService>(ConfigService),
    databaseConfigDriver:
      module.get<DatabaseConfigDriver>(DatabaseConfigDriver),
    environmentConfigDriver: module.get<EnvironmentConfigDriver>(
      EnvironmentConfigDriver,
    ),
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
  let configService: ConfigService;
  let databaseConfigDriver: DatabaseConfigDriver;
  let environmentConfigDriver: EnvironmentConfigDriver;

  beforeEach(async () => {
    const testModule = await setupTestModule();

    service = testModule.service;
    configService = testModule.configService;
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
    it('should initialize with environment driver when database config is disabled', () => {
      jest.spyOn(configService, 'get').mockReturnValue(false);

      const newService = new TwentyConfigService(
        configService,
        databaseConfigDriver,
        environmentConfigDriver,
      );

      const privateProps =
        newService as unknown as TwentyConfigServicePrivateProps;

      expect(privateProps.driver).toBe(environmentConfigDriver);
      expect(privateProps.isConfigVarInDbEnabled).toBe(false);
    });

    it('should initialize with environment driver initially when database config is enabled', () => {
      jest.spyOn(configService, 'get').mockReturnValue(true);

      const newService = new TwentyConfigService(
        configService,
        databaseConfigDriver,
        environmentConfigDriver,
      );

      const privateProps =
        newService as unknown as TwentyConfigServicePrivateProps;

      expect(privateProps.driver).toBe(environmentConfigDriver);
      expect(privateProps.isConfigVarInDbEnabled).toBe(true);
    });
  });

  describe('onModuleInit', () => {
    it('should set initialization state to INITIALIZED when db config is disabled', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(false);

      const newService = new TwentyConfigService(
        configService,
        databaseConfigDriver,
        environmentConfigDriver,
      );

      await newService.onModuleInit();

      const privateProps =
        newService as unknown as TwentyConfigServicePrivateProps;

      expect(privateProps.configInitializationState).toBe(
        ConfigInitializationState.INITIALIZED,
      );
    });

    it('should not change initialization state when db config is enabled', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(true);

      const newService = new TwentyConfigService(
        configService,
        databaseConfigDriver,
        environmentConfigDriver,
      );

      await newService.onModuleInit();

      const privateProps =
        newService as unknown as TwentyConfigServicePrivateProps;

      expect(privateProps.configInitializationState).toBe(
        ConfigInitializationState.NOT_INITIALIZED,
      );
    });
  });

  describe('onApplicationBootstrap', () => {
    it('should do nothing when db config is disabled', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(false);

      const newService = new TwentyConfigService(
        configService,
        databaseConfigDriver,
        environmentConfigDriver,
      );

      await newService.onApplicationBootstrap();

      expect(databaseConfigDriver.initialize).not.toHaveBeenCalled();

      const privateProps =
        newService as unknown as TwentyConfigServicePrivateProps;

      expect(privateProps.driver).toBe(environmentConfigDriver);
    });

    it('should initialize database driver when db config is enabled', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(true);

      const newService = new TwentyConfigService(
        configService,
        databaseConfigDriver,
        environmentConfigDriver,
      );

      await newService.onApplicationBootstrap();

      expect(databaseConfigDriver.initialize).toHaveBeenCalled();

      const privateProps =
        newService as unknown as TwentyConfigServicePrivateProps;

      expect(privateProps.driver).toBe(databaseConfigDriver);
      expect(privateProps.configInitializationState).toBe(
        ConfigInitializationState.INITIALIZED,
      );
    });

    it('should fall back to environment driver when database initialization fails', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(true);
      jest
        .spyOn(databaseConfigDriver, 'initialize')
        .mockRejectedValue(new Error('DB initialization failed'));

      const newService = new TwentyConfigService(
        configService,
        databaseConfigDriver,
        environmentConfigDriver,
      );

      await newService.onApplicationBootstrap();

      expect(databaseConfigDriver.initialize).toHaveBeenCalled();

      const privateProps =
        newService as unknown as TwentyConfigServicePrivateProps;

      expect(privateProps.driver).toBe(environmentConfigDriver);
      expect(privateProps.configInitializationState).toBe(
        ConfigInitializationState.FAILED,
      );
    });
  });

  describe('get', () => {
    it('should delegate to the active driver', () => {
      const key = 'TEST_VAR' as keyof ConfigVariables;
      const expectedValue = 'test value';

      jest.spyOn(databaseConfigDriver, 'get').mockReturnValue(expectedValue);

      setPrivateProps(service, { driver: databaseConfigDriver });

      const result = service.get(key);

      expect(result).toBe(expectedValue);
      expect(databaseConfigDriver.get).toHaveBeenCalledWith(key);
    });
  });

  describe('update', () => {
    const setupUpdateTest = (
      props: Partial<TwentyConfigServicePrivateProps>,
    ) => {
      setPrivateProps(service, {
        isConfigVarInDbEnabled: true,
        configInitializationState: ConfigInitializationState.INITIALIZED,
        driver: databaseConfigDriver,
        ...props,
      });
    };

    it('should throw error when database config is disabled', async () => {
      setupUpdateTest({ isConfigVarInDbEnabled: false });

      await expect(
        service.update('TEST_VAR' as keyof ConfigVariables, 'new value'),
      ).rejects.toThrow(
        'Database configuration is disabled, cannot update configuration',
      );
    });

    it('should throw error when not initialized', async () => {
      setupUpdateTest({
        configInitializationState: ConfigInitializationState.NOT_INITIALIZED,
      });

      await expect(
        service.update('TEST_VAR' as keyof ConfigVariables, 'new value'),
      ).rejects.toThrow(
        'TwentyConfigService not initialized, cannot update configuration',
      );
    });

    it('should throw error when updating environment-only variable', async () => {
      setupUpdateTest({});

      await expect(
        service.update('ENV_ONLY_VAR' as keyof ConfigVariables, 'new value'),
      ).rejects.toThrow(
        'Cannot update environment-only variable: ENV_ONLY_VAR',
      );
    });

    it('should throw error when driver is not DatabaseConfigDriver', async () => {
      setupUpdateTest({ driver: environmentConfigDriver });

      await expect(
        service.update('TEST_VAR' as keyof ConfigVariables, 'new value'),
      ).rejects.toThrow(
        'Database driver not initialized, cannot update configuration',
      );
    });

    it('should update config when all conditions are met', async () => {
      const key = 'TEST_VAR' as keyof ConfigVariables;
      const newValue = 'new value';

      setupUpdateTest({});
      jest.spyOn(databaseConfigDriver, 'update').mockResolvedValue(undefined);

      await service.update(key, newValue);

      expect(databaseConfigDriver.update).toHaveBeenCalledWith(key, newValue);
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

          return values[keyStr] || '';
        });

      jest
        .spyOn(databaseConfigDriver, 'get')
        .mockImplementation((key: keyof ConfigVariables) => {
          const keyStr = String(key);

          if (mockConfigVarMetadata[keyStr]?.isEnvOnly) {
            return environmentConfigDriver.get(key);
          }
          const values = {
            TEST_VAR: 'db test value',
            SENSITIVE_VAR: 'sensitive_data_123',
          };

          return values[keyStr] || '';
        });
    };

    beforeEach(() => {
      setupDriverMocks();
    });

    it('should return all config variables with environment source when using environment driver', () => {
      setPrivateProps(service, {
        driver: environmentConfigDriver,
        isConfigVarInDbEnabled: false,
        configInitializationState: ConfigInitializationState.INITIALIZED,
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

    it('should return config variables with database source when using database driver', () => {
      setPrivateProps(service, {
        driver: databaseConfigDriver,
        isConfigVarInDbEnabled: true,
        configInitializationState: ConfigInitializationState.INITIALIZED,
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
    const setupCacheInfoTest = (
      props: Partial<TwentyConfigServicePrivateProps>,
    ) => {
      setPrivateProps(service, {
        driver: environmentConfigDriver,
        isConfigVarInDbEnabled: false,
        configInitializationState: ConfigInitializationState.INITIALIZED,
        ...props,
      });
    };

    it('should return basic info when not using database driver', () => {
      setupCacheInfoTest({});

      const result = service.getCacheInfo();

      expect(result).toEqual({
        usingDatabaseDriver: false,
        initializationState: 'INITIALIZED',
      });
    });

    it('should return cache stats when using database driver', () => {
      const cacheStats = {
        positiveEntries: 2,
        negativeEntries: 1,
        cacheKeys: ['TEST_VAR', 'SENSITIVE_VAR'],
      };

      setupCacheInfoTest({
        driver: databaseConfigDriver,
        isConfigVarInDbEnabled: true,
      });

      jest
        .spyOn(databaseConfigDriver, 'getCacheInfo')
        .mockReturnValue(cacheStats);

      const result = service.getCacheInfo();

      expect(result).toEqual({
        usingDatabaseDriver: true,
        initializationState: 'INITIALIZED',
        cacheStats,
      });
    });
  });
});
