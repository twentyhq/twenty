import { Injectable, Logger, Optional } from '@nestjs/common';

import { isString } from 'class-validator';
import { type LoggerOptions } from 'typeorm/logger/LoggerOptions';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_MASKING_CONFIG } from 'src/engine/core-modules/twenty-config/constants/config-variables-masking-config';
import { type ConfigVariablesMetadataOptions } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';
import { DatabaseConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/database-config.driver';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { ConfigSource } from 'src/engine/core-modules/twenty-config/enums/config-source.enum';
import { ConfigVariablesMaskingStrategies } from 'src/engine/core-modules/twenty-config/enums/config-variables-masking-strategies.enum';
import {
  ConfigVariableException,
  ConfigVariableExceptionCode,
} from 'src/engine/core-modules/twenty-config/twenty-config.exception';
import { configVariableMaskSensitiveData } from 'src/engine/core-modules/twenty-config/utils/config-variable-mask-sensitive-data.util';
import { isEnvOnlyConfigVar } from 'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util';
import { TypedReflect } from 'src/utils/typed-reflect';

@Injectable()
export class TwentyConfigService {
  private readonly logger = new Logger(TwentyConfigService.name);
  private readonly isDatabaseDriverActive: boolean;

  constructor(
    private readonly environmentConfigDriver: EnvironmentConfigDriver,
    @Optional() private readonly databaseConfigDriver: DatabaseConfigDriver,
  ) {
    const isConfigVariablesInDbEnabled = this.environmentConfigDriver.get(
      'IS_CONFIG_VARIABLES_IN_DB_ENABLED',
    );

    this.isDatabaseDriverActive =
      isConfigVariablesInDbEnabled && !!this.databaseConfigDriver;

    this.logger.log(
      `Database configuration is ${isConfigVariablesInDbEnabled ? 'enabled' : 'disabled'}`,
    );

    if (isConfigVariablesInDbEnabled && !this.databaseConfigDriver) {
      this.logger.warn(
        'Database config is enabled but driver is not available. Using environment variables only.',
      );
    }

    if (this.isDatabaseDriverActive) {
      this.logger.log('Using database configuration driver');
      // The database driver will load config variables asynchronously via its onModuleInit lifecycle hook
      // In the meantime, we'll use the environment driver -- fallback
    } else {
      this.logger.log('Using environment variables only for configuration');
    }
  }

  get<T extends keyof ConfigVariables>(key: T): ConfigVariables[T] {
    if (isEnvOnlyConfigVar(key)) {
      return this.environmentConfigDriver.get(key);
    }

    if (this.isDatabaseDriverActive) {
      const cachedValueFromDb = this.databaseConfigDriver.get(key);

      if (cachedValueFromDb !== undefined) {
        return cachedValueFromDb;
      }
    }

    return this.environmentConfigDriver.get(key);
  }

  async set<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
  ): Promise<void> {
    this.validateDatabaseDriverActive('set');
    this.validateNotEnvOnly(key, 'create');
    this.validateConfigVariableExists(key as string);

    await this.databaseConfigDriver.set(key, value);
  }

  async update<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
  ): Promise<void> {
    this.validateDatabaseDriverActive('update');
    this.validateNotEnvOnly(key, 'update');
    this.validateConfigVariableExists(key as string);

    await this.databaseConfigDriver.update(key, value);
  }

  getMetadata(
    key: keyof ConfigVariables,
  ): ConfigVariablesMetadataOptions | undefined {
    return this.getConfigMetadata()[key as string];
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

    const metadata = this.getConfigMetadata();

    Object.entries(metadata).forEach(([key, envMetadata]) => {
      const typedKey = key as keyof ConfigVariables;
      let value = this.get(typedKey) ?? '';
      const source = this.determineConfigSource(typedKey, value, envMetadata);

      value = this.maskSensitiveValue(typedKey, value);

      result[key] = {
        value,
        metadata: envMetadata,
        source,
      };
    });

    return result;
  }

  getVariableWithMetadata(key: keyof ConfigVariables): {
    value: ConfigVariables[keyof ConfigVariables];
    metadata: ConfigVariablesMetadataOptions;
    source: ConfigSource;
  } | null {
    const metadata = this.getMetadata(key);

    if (!metadata) {
      return null;
    }

    let value = this.get(key) ?? '';
    const source = this.determineConfigSource(key, value, metadata);

    value = this.maskSensitiveValue(key, value);

    return {
      value,
      metadata,
      source,
    };
  }

  getCacheInfo(): {
    usingDatabaseDriver: boolean;
    cacheStats?: {
      foundConfigValues: number;
      knownMissingKeys: number;
      cacheKeys: string[];
    };
  } {
    const result = {
      usingDatabaseDriver: this.isDatabaseDriverActive,
    };

    if (this.isDatabaseDriverActive) {
      return {
        ...result,
        cacheStats: this.databaseConfigDriver.getCacheInfo(),
      };
    }

    return result;
  }

  async delete(key: keyof ConfigVariables): Promise<void> {
    this.validateDatabaseDriverActive('delete');
    this.validateConfigVariableExists(key as string);
    await this.databaseConfigDriver.delete(key);
  }

  private getConfigMetadata(): Record<string, ConfigVariablesMetadataOptions> {
    return TypedReflect.getMetadata('config-variables', ConfigVariables) ?? {};
  }

  private validateDatabaseDriverActive(operation: string): void {
    if (!this.isDatabaseDriverActive) {
      throw new ConfigVariableException(
        `Database configuration is disabled or unavailable, cannot ${operation} configuration`,
        ConfigVariableExceptionCode.DATABASE_CONFIG_DISABLED,
      );
    }
  }

  getLoggingConfig(): LoggerOptions {
    switch (this.get('NODE_ENV')) {
      case NodeEnvironment.DEVELOPMENT:
        return ['query', 'error'];
      case NodeEnvironment.TEST:
        return [];
      default:
        return ['error'];
    }
  }

  private validateNotEnvOnly<T extends keyof ConfigVariables>(
    key: T,
    operation: string,
  ): void {
    const metadata = this.getConfigMetadata();
    const envMetadata = metadata[key as string];

    if (envMetadata?.isEnvOnly) {
      throw new ConfigVariableException(
        `Cannot ${operation} environment-only variable: ${key as string}`,
        ConfigVariableExceptionCode.ENVIRONMENT_ONLY_VARIABLE,
      );
    }
  }

  private determineConfigSource<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
    metadata: ConfigVariablesMetadataOptions,
  ): ConfigSource {
    const configVars = new ConfigVariables();

    if (!this.isDatabaseDriverActive || metadata.isEnvOnly) {
      return value === configVars[key]
        ? ConfigSource.DEFAULT
        : ConfigSource.ENVIRONMENT;
    }

    const dbValue = this.databaseConfigDriver.get(key);

    if (dbValue !== undefined) {
      return ConfigSource.DATABASE;
    }

    return value === configVars[key]
      ? ConfigSource.DEFAULT
      : ConfigSource.ENVIRONMENT;
  }

  private maskSensitiveValue<T extends keyof ConfigVariables>(
    key: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any {
    if (!isString(value) || !(key in CONFIG_VARIABLES_MASKING_CONFIG)) {
      return value;
    }

    const varMaskingConfig =
      CONFIG_VARIABLES_MASKING_CONFIG[
        key as keyof typeof CONFIG_VARIABLES_MASKING_CONFIG
      ];
    const options =
      varMaskingConfig.strategy ===
      ConfigVariablesMaskingStrategies.LAST_N_CHARS
        ? { chars: varMaskingConfig.chars }
        : undefined;

    return configVariableMaskSensitiveData(value, varMaskingConfig.strategy, {
      ...options,
      variableName: key as string,
    });
  }

  validateConfigVariableExists(key: string): boolean {
    const metadata = this.getConfigMetadata();
    const keyExists = key in metadata;

    if (!keyExists) {
      throw new ConfigVariableException(
        `Config variable "${key}" does not exist in ConfigVariables`,
        ConfigVariableExceptionCode.VARIABLE_NOT_FOUND,
      );
    }

    return true;
  }
}
