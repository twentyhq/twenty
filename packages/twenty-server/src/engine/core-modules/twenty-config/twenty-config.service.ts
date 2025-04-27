import { Injectable, Logger, Optional } from '@nestjs/common';

import { isString } from 'class-validator';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_MASKING_CONFIG } from 'src/engine/core-modules/twenty-config/constants/config-variables-masking-config';
import { ConfigVariablesMetadataOptions } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';
import { DatabaseConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/database-config.driver';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { ConfigSource } from 'src/engine/core-modules/twenty-config/enums/config-source.enum';
import { ConfigVariablesMaskingStrategies } from 'src/engine/core-modules/twenty-config/enums/config-variables-masking-strategies.enum';
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

      return this.environmentConfigDriver.get(key);
    }

    return this.environmentConfigDriver.get(key);
  }

  async set<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
  ): Promise<void> {
    if (!this.isDatabaseDriverActive) {
      throw new Error(
        'Database configuration is disabled or unavailable, cannot set configuration',
      );
    }

    const metadata =
      TypedReflect.getMetadata('config-variables', ConfigVariables) ?? {};
    const envMetadata = metadata[key];

    if (envMetadata?.isEnvOnly) {
      throw new Error(
        `Cannot create environment-only variable: ${key as string}`,
      );
    }

    await this.databaseConfigDriver.set(key, value);
  }

  async update<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
  ): Promise<void> {
    if (!this.isDatabaseDriverActive) {
      throw new Error(
        'Database configuration is disabled or unavailable, cannot update configuration',
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

    try {
      await this.databaseConfigDriver.update(key, value);
      this.logger.debug(`Updated config variable: ${key as string}`);
    } catch (error) {
      this.logger.error(`Failed to update config for ${key as string}`, error);
      throw error;
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

    Object.entries(metadata).forEach(([key, envMetadata]) => {
      let value = this.get(key as keyof ConfigVariables) ?? '';
      let source = ConfigSource.ENVIRONMENT;

      if (!this.isDatabaseDriverActive || envMetadata.isEnvOnly) {
        source =
          value === configVars[key as keyof ConfigVariables]
            ? ConfigSource.DEFAULT
            : ConfigSource.ENVIRONMENT;
      } else {
        const dbValue = this.databaseConfigDriver.get(
          key as keyof ConfigVariables,
        );

        if (dbValue !== undefined) {
          source = ConfigSource.DATABASE;
        } else {
          source =
            value === configVars[key as keyof ConfigVariables]
              ? ConfigSource.DEFAULT
              : ConfigSource.ENVIRONMENT;
        }
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

  getVariableWithMetadata(key: keyof ConfigVariables): {
    value: ConfigVariables[keyof ConfigVariables];
    metadata: ConfigVariablesMetadataOptions;
    source: ConfigSource;
  } | null {
    const metadata = TypedReflect.getMetadata(
      'config-variables',
      ConfigVariables,
    )?.[key as string];

    if (!metadata) {
      return null;
    }

    const configVars = new ConfigVariables();
    let value = this.get(key) ?? '';
    let source = ConfigSource.ENVIRONMENT;

    if (!this.isDatabaseDriverActive || metadata.isEnvOnly) {
      source =
        value === configVars[key]
          ? ConfigSource.DEFAULT
          : ConfigSource.ENVIRONMENT;
    } else {
      const dbValue = this.databaseConfigDriver.get(key);

      if (dbValue !== undefined) {
        source = ConfigSource.DATABASE;
      } else {
        source =
          value === configVars[key]
            ? ConfigSource.DEFAULT
            : ConfigSource.ENVIRONMENT;
      }
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
    if (!this.isDatabaseDriverActive) {
      throw new Error(
        'Database configuration is disabled or unavailable, cannot delete configuration',
      );
    }
    await this.databaseConfigDriver.delete(key);
  }
}
