/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ENVIRONMENT_VARIABLES_MASKING_CONFIG } from 'src/engine/core-modules/environment/constants/environment-variables-masking-config';
import { EnvironmentVariablesMetadataOptions } from 'src/engine/core-modules/environment/decorators/environment-variables-metadata.decorator';
import { EnvironmentVariablesMaskingStrategies } from 'src/engine/core-modules/environment/enums/environment-variables-masking-strategies.enum';
import { InitializationState } from 'src/engine/core-modules/environment/enums/initialization-state.enum';
import { EnvironmentVariables } from 'src/engine/core-modules/environment/environment-variables';
import { environmentVariableMaskSensitiveData } from 'src/engine/core-modules/environment/utils/environment-variable-mask-sensitive-data.util';
import { TypedReflect } from 'src/utils/typed-reflect';

import { DatabaseDriver } from './drivers/database.driver';
import { EnvironmentDriver } from './drivers/environment.driver';

@Injectable()
export class EnvironmentService
  implements OnModuleInit, OnApplicationBootstrap
{
  private driver: DatabaseDriver | EnvironmentDriver;
  private initializationState = InitializationState.NOT_INITIALIZED;
  private readonly isConfigVarInDbEnabled: boolean;
  private readonly logger = new Logger(EnvironmentService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseDriver: DatabaseDriver,
    private readonly environmentDriver: EnvironmentDriver,
  ) {
    // Always start with environment driver during construction
    this.driver = this.environmentDriver;

    const configVarInDb = this.configService.get('IS_CONFIG_VAR_IN_DB_ENABLED');

    // Handle both string and boolean values for IS_CONFIG_VAR_IN_DB_ENABLED
    // TODO: Remove this once we have a proper way to handle this, or am I being dumb?
    this.isConfigVarInDbEnabled =
      configVarInDb === true || configVarInDb === 'true';

    this.logger.log(
      `Database configuration is ${this.isConfigVarInDbEnabled ? 'enabled' : 'disabled'}`,
    );
  }

  async onModuleInit() {
    // During module init, only use the environment driver
    // and mark as initialized if not using DB driver
    if (!this.isConfigVarInDbEnabled) {
      this.logger.log(
        'Database configuration is disabled, using environment variables only',
      );
      this.initializationState = InitializationState.INITIALIZED;

      return;
    }

    // If we're using DB driver, mark as not initialized yet
    // Will be fully initialized in onApplicationBootstrap
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

      // Try to initialize the database driver
      await this.databaseDriver.initialize();

      // If initialization succeeds, switch to the database driver
      this.driver = this.databaseDriver;
      this.initializationState = InitializationState.INITIALIZED;
      this.logger.log('Database driver initialized successfully');
      this.logger.log(`Active driver: DatabaseDriver`);
    } catch (error) {
      // If initialization fails for any reason, log the error and keep using the environment driver
      this.logger.error(
        'Failed to initialize database driver, falling back to environment variables',
        error,
      );
      this.initializationState = InitializationState.FAILED;

      // Ensure we're still using the environment driver
      this.driver = this.environmentDriver;
      this.logger.log(`Active driver: EnvironmentDriver (fallback)`);
    }
  }

  get<T extends keyof EnvironmentVariables>(key: T): EnvironmentVariables[T] {
    const value = this.driver.get(key);

    this.logger.debug(
      `Getting value for '${key}' from ${this.driver.constructor.name}`,
      {
        valueType: typeof value,
        isArray: Array.isArray(value),
        value: typeof value === 'object' ? JSON.stringify(value) : value,
      },
    );

    return value;
  }

  async update<T extends keyof EnvironmentVariables>(
    key: T,
    value: EnvironmentVariables[T],
  ): Promise<void> {
    if (!this.isConfigVarInDbEnabled) {
      throw new Error(
        'Database configuration is disabled, cannot update configuration',
      );
    }

    if (this.initializationState !== InitializationState.INITIALIZED) {
      throw new Error(
        'Environment service not initialized, cannot update configuration',
      );
    }

    const metadata =
      TypedReflect.getMetadata('environment-variables', EnvironmentVariables) ??
      {};
    const envMetadata = metadata[key];

    if (envMetadata?.isEnvOnly) {
      throw new Error(
        `Cannot update environment-only variable: ${key as string}`,
      );
    }

    if (this.driver === this.databaseDriver) {
      await this.databaseDriver.update(key, value);
    } else {
      throw new Error(
        'Database driver not active, cannot update configuration',
      );
    }
  }

  getMetadata(
    key: keyof EnvironmentVariables,
  ): EnvironmentVariablesMetadataOptions | undefined {
    const metadata =
      TypedReflect.getMetadata('environment-variables', EnvironmentVariables) ??
      {};

    return metadata[key];
  }

  getAll(): Record<
    string,
    {
      value: EnvironmentVariables[keyof EnvironmentVariables];
      metadata: EnvironmentVariablesMetadataOptions;
      source: string;
    }
  > {
    const result: Record<
      string,
      {
        value: EnvironmentVariables[keyof EnvironmentVariables];
        metadata: EnvironmentVariablesMetadataOptions;
        source: string;
      }
    > = {};

    const envVars = new EnvironmentVariables();
    const metadata =
      TypedReflect.getMetadata('environment-variables', EnvironmentVariables) ??
      {};

    const isUsingDatabaseDriver =
      this.driver === this.databaseDriver &&
      this.isConfigVarInDbEnabled &&
      this.initializationState === InitializationState.INITIALIZED;

    Object.entries(metadata).forEach(([key, envMetadata]) => {
      let value = this.get(key as keyof EnvironmentVariables) ?? '';
      let source = 'ENVIRONMENT';

      if (isUsingDatabaseDriver && !envMetadata.isEnvOnly) {
        const valueCacheEntry = this.databaseDriver.getFromValueCache(key);

        if (valueCacheEntry) {
          source = 'DATABASE';
        } else if (value === envVars[key as keyof EnvironmentVariables]) {
          source = 'DEFAULT';
        }
      } else if (value === envVars[key as keyof EnvironmentVariables]) {
        source = 'DEFAULT';
      }

      if (
        typeof value === 'string' &&
        key in ENVIRONMENT_VARIABLES_MASKING_CONFIG
      ) {
        const varMaskingConfig =
          ENVIRONMENT_VARIABLES_MASKING_CONFIG[
            key as keyof typeof ENVIRONMENT_VARIABLES_MASKING_CONFIG
          ];
        const options =
          varMaskingConfig.strategy ===
          EnvironmentVariablesMaskingStrategies.LAST_N_CHARS
            ? { chars: varMaskingConfig.chars }
            : undefined;

        value = environmentVariableMaskSensitiveData(
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

  clearCache(key: keyof EnvironmentVariables): void {
    if (this.driver === this.databaseDriver) {
      this.databaseDriver.clearCache(key);
    }
  }

  async refreshConfig(key: keyof EnvironmentVariables): Promise<void> {
    if (this.driver === this.databaseDriver) {
      await this.databaseDriver.refreshConfig(key);
    }
  }

  // Get cache information for debugging
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
      this.driver === this.databaseDriver &&
      this.isConfigVarInDbEnabled &&
      this.initializationState === InitializationState.INITIALIZED;

    const result = {
      usingDatabaseDriver: isUsingDatabaseDriver,
      initializationState: InitializationState[this.initializationState],
    };

    if (isUsingDatabaseDriver) {
      return {
        ...result,
        cacheStats: this.databaseDriver.getCacheInfo(),
      };
    }

    return result;
  }
}
