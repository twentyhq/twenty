import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { isString } from 'class-validator';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_MASKING_CONFIG } from 'src/engine/core-modules/twenty-config/constants/config-variables-masking-config';
import { ConfigVariablesMetadataOptions } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';
import { DatabaseConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/database-config.driver';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { ConfigSource } from 'src/engine/core-modules/twenty-config/enums/config-source.enum';
import { ConfigVariablesMaskingStrategies } from 'src/engine/core-modules/twenty-config/enums/config-variables-masking-strategies.enum';
import { InitializationState } from 'src/engine/core-modules/twenty-config/enums/initialization-state.enum';
import { configVariableMaskSensitiveData } from 'src/engine/core-modules/twenty-config/utils/config-variable-mask-sensitive-data.util';
import { TypedReflect } from 'src/utils/typed-reflect';

@Injectable()
export class TwentyConfigService
  implements OnModuleInit, OnApplicationBootstrap
{
  private driver: DatabaseConfigDriver | EnvironmentConfigDriver;
  private initializationState = InitializationState.NOT_INITIALIZED;
  private readonly isConfigVarInDbEnabled: boolean;
  private readonly logger = new Logger(TwentyConfigService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseConfigDriver: DatabaseConfigDriver,
    private readonly environmentConfigDriver: EnvironmentConfigDriver,
  ) {
    this.driver = this.environmentConfigDriver;

    const configVarInDb = this.configService.get(
      'IS_CONFIG_VARIABLES_IN_DB_ENABLED',
    );

    this.isConfigVarInDbEnabled = configVarInDb === true;

    this.logger.log(
      `Database configuration is ${this.isConfigVarInDbEnabled ? 'enabled' : 'disabled'}`,
    );
  }

  async onModuleInit() {
    if (!this.isConfigVarInDbEnabled) {
      this.logger.log(
        'Database configuration is disabled, using environment variables only',
      );
      this.initializationState = InitializationState.INITIALIZED;

      return;
    }

    this.logger.log(
      'Database configuration is enabled, will initialize after application bootstrap',
    );
  }

  async onApplicationBootstrap() {
    if (!this.isConfigVarInDbEnabled) {
      return;
    }

    try {
      this.logger.log('Initializing database driver for configuration');
      this.initializationState = InitializationState.INITIALIZING;

      await this.databaseConfigDriver.initialize();

      this.driver = this.databaseConfigDriver;
      this.initializationState = InitializationState.INITIALIZED;
      this.logger.log('Database driver initialized successfully');
      this.logger.log(`Active driver: DatabaseDriver`);
    } catch (error) {
      this.logger.error(
        'Failed to initialize database driver, falling back to environment variables',
        error,
      );
      this.initializationState = InitializationState.FAILED;

      this.driver = this.environmentConfigDriver;
      this.logger.log(`Active driver: EnvironmentDriver (fallback)`);
    }
  }

  get<T extends keyof ConfigVariables>(key: T): ConfigVariables[T] {
    const value = this.driver.get(key);

    return value;
  }

  async update<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
  ): Promise<void> {
    if (!this.isConfigVarInDbEnabled) {
      throw new Error(
        'Database configuration is disabled, cannot update configuration',
      );
    }

    if (this.initializationState !== InitializationState.INITIALIZED) {
      throw new Error(
        'TwentyConfigService not initialized, cannot update configuration',
      );
    }

    const metadata =
      TypedReflect.getMetadata('config-variables', ConfigVariables) ?? {};
    const envMetadata = metadata[key];

    if (envMetadata?.isEnvOnly) {
      throw new Error(
        `Cannot update environment-only variable: ${key as string}`,
      );
    }

    if (this.driver === this.databaseConfigDriver) {
      await this.databaseConfigDriver.update(key, value);
    } else {
      throw new Error(
        'Database driver not initialized, cannot update configuration',
      );
    }
  }

  getMetadata(
    key: keyof ConfigVariables,
  ): ConfigVariablesMetadataOptions | undefined {
    const metadata =
      TypedReflect.getMetadata('config-variables', ConfigVariables) ?? {};

    return metadata[key];
  }

  getAll(): Record<
    string,
    {
      value: ConfigVariables[keyof ConfigVariables];
      metadata: ConfigVariablesMetadataOptions;
      source: ConfigSource;
    }
  > {
    const result: Record<
      string,
      {
        value: ConfigVariables[keyof ConfigVariables];
        metadata: ConfigVariablesMetadataOptions;
        source: ConfigSource;
      }
    > = {};

    const configVars = new ConfigVariables();
    const metadata =
      TypedReflect.getMetadata('config-variables', ConfigVariables) ?? {};

    const isUsingDatabaseDriver =
      this.driver === this.databaseConfigDriver &&
      this.isConfigVarInDbEnabled &&
      this.initializationState === InitializationState.INITIALIZED;

    Object.entries(metadata).forEach(([key, envMetadata]) => {
      let value = this.get(key as keyof ConfigVariables) ?? '';
      let source = ConfigSource.ENVIRONMENT;

      if (!isUsingDatabaseDriver || envMetadata.isEnvOnly) {
        if (value === configVars[key as keyof ConfigVariables]) {
          source = ConfigSource.DEFAULT;
        }
      } else {
        const dbValue = value;

        source =
          dbValue !== configVars[key as keyof ConfigVariables]
            ? ConfigSource.DATABASE
            : ConfigSource.DEFAULT;
      }

      if (isString(value) && key in CONFIG_VARIABLES_MASKING_CONFIG) {
        const varMaskingConfig =
          CONFIG_VARIABLES_MASKING_CONFIG[
            key as keyof typeof CONFIG_VARIABLES_MASKING_CONFIG
          ];
        const options =
          varMaskingConfig.strategy ===
          ConfigVariablesMaskingStrategies.LAST_N_CHARS
            ? { chars: varMaskingConfig.chars }
            : undefined;

        value = configVariableMaskSensitiveData(
          value,
          varMaskingConfig.strategy,
          { ...options, variableName: key },
        );
      }

      result[key] = {
        value,
        metadata: envMetadata,
        source,
      };
    });

    return result;
  }

  async refreshConfig(key: keyof ConfigVariables): Promise<void> {
    if (this.driver === this.databaseConfigDriver) {
      await this.databaseConfigDriver.refreshConfig(key);
    }
  }

  getCacheInfo(): {
    usingDatabaseDriver: boolean;
    initializationState: string;
    cacheStats?: {
      positiveEntries: number;
      negativeEntries: number;
      cacheKeys: string[];
    };
  } {
    const isUsingDatabaseDriver =
      this.driver === this.databaseConfigDriver &&
      this.isConfigVarInDbEnabled &&
      this.initializationState === InitializationState.INITIALIZED;

    const result = {
      usingDatabaseDriver: isUsingDatabaseDriver,
      initializationState: InitializationState[this.initializationState],
    };

    if (isUsingDatabaseDriver) {
      return {
        ...result,
        cacheStats: this.databaseConfigDriver.getCacheInfo(),
      };
    }

    return result;
  }
}
