import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { type DatabaseConfigDriverInterface } from 'src/engine/core-modules/twenty-config/drivers/interfaces/database-config-driver.interface';

import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_REFRESH_CRON_INTERVAL } from 'src/engine/core-modules/twenty-config/constants/config-variables-refresh-cron-interval.constants';
import { ConfigStorageService } from 'src/engine/core-modules/twenty-config/storage/config-storage.service';
import { ConfigVariableVersionAction } from 'src/engine/core-modules/twenty-config/versioning/config-variable-version.entity';
import { ConfigVariableVersionService } from 'src/engine/core-modules/twenty-config/versioning/config-variable-version.service';
import { isEnvOnlyConfigVar } from 'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util';

@Injectable()
export class DatabaseConfigDriver
  implements DatabaseConfigDriverInterface, OnModuleInit
{
  private readonly logger = new Logger(DatabaseConfigDriver.name);
  private readonly allPossibleConfigKeys: Array<keyof ConfigVariables>;

  constructor(
    private readonly configCache: ConfigCacheService,
    private readonly configStorage: ConfigStorageService,
    private readonly configVariableVersionService: ConfigVariableVersionService,
  ) {
    const allKeys = Object.keys(new ConfigVariables()) as Array<
      keyof ConfigVariables
    >;

    this.allPossibleConfigKeys = allKeys.filter(
      (key) => !isEnvOnlyConfigVar(key),
    );

    this.logger.debug(
      '[INIT] Database config driver created, monitoring keys: ' +
        this.allPossibleConfigKeys.length,
    );
  }

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('[INIT] Loading initial config variables from database');
      const loadedCount = await this.loadAllConfigVarsFromDb();

      this.logger.log(
        `[INIT] Config variables loaded: ${loadedCount} values found in DB, ${this.allPossibleConfigKeys.length - loadedCount} falling to env vars/defaults`,
      );
    } catch (error) {
      this.logger.error(
        '[INIT] Failed to load config variables from database, falling back to environment variables',
        error instanceof Error ? error.stack : error,
      );
      // Don't rethrow to allow the application to continue
      // The driver's cache will be empty but the service will fall back to env vars
    }
  }

  get<T extends keyof ConfigVariables>(key: T): ConfigVariables[T] | undefined {
    return this.configCache.get(key);
  }

  async set<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
  ): Promise<void> {
    if (isEnvOnlyConfigVar(key)) {
      throw new Error(`Cannot set environment-only variable: ${key as string}`);
    }

    const previousValue = await this.configStorage.get(key);

    await this.configStorage.set(key, value);
    this.configCache.set(key, value);

    await this.recordConfigVariableVersion({
      key,
      action: previousValue === undefined ? ConfigVariableVersionAction.SET : ConfigVariableVersionAction.UPDATE,
      previousValue,
      nextValue: value,
    });
  }

  async update<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
  ): Promise<void> {
    if (isEnvOnlyConfigVar(key)) {
      throw new Error(
        `Cannot update environment-only variable: ${key as string}`,
      );
    }

    const previousValue = await this.configStorage.get(key);

    await this.configStorage.set(key, value);
    this.configCache.set(key, value);

    await this.recordConfigVariableVersion({
      key,
      action: previousValue === undefined ? ConfigVariableVersionAction.SET : ConfigVariableVersionAction.UPDATE,
      previousValue,
      nextValue: value,
    });
  }

  getCacheInfo(): {
    foundConfigValues: number;
    knownMissingKeys: number;
    cacheKeys: string[];
  } {
    return this.configCache.getCacheInfo();
  }

  private async loadAllConfigVarsFromDb(): Promise<number> {
    const configVars = await this.configStorage.loadAll();

    for (const [key, value] of configVars.entries()) {
      this.configCache.set(key, value);
    }

    for (const key of this.allPossibleConfigKeys) {
      if (!configVars.has(key)) {
        this.configCache.markKeyAsMissing(key);
      }
    }

    return configVars.size;
  }

  async delete(key: keyof ConfigVariables): Promise<void> {
    if (isEnvOnlyConfigVar(key)) {
      throw new Error(
        `Cannot delete environment-only variable: ${key as string}`,
      );
    }
    const previousValue = await this.configStorage.get(key);

    await this.configStorage.delete(key);
    this.configCache.markKeyAsMissing(key);

    await this.recordConfigVariableVersion({
      key,
      action: ConfigVariableVersionAction.DELETE,
      previousValue,
      nextValue: undefined,
    });
  }

  /**
   * Refreshes all database-backed config variables.
   * This method runs on a schedule and fetches all configs in one database query,
   * then updates the cache with fresh values.
   */
  @Cron(CONFIG_VARIABLES_REFRESH_CRON_INTERVAL)
  async refreshAllCache(): Promise<void> {
    try {
      const dbValues = await this.configStorage.loadAll();

      for (const [key, value] of dbValues.entries()) {
        if (!isEnvOnlyConfigVar(key)) {
          this.configCache.set(key, value);
        }
      }

      for (const key of this.allPossibleConfigKeys) {
        if (!dbValues.has(key)) {
          this.configCache.markKeyAsMissing(key);
        }
      }
    } catch (error) {
      // Error is caught and logged but not rethrown to prevent the cron job from crashing
      this.logger.error(
        'Failed to refresh config variables from database',
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private async recordConfigVariableVersion<T extends keyof ConfigVariables>({
    key,
    action,
    previousValue,
    nextValue,
  }: {
    key: T;
    action: ConfigVariableVersionAction;
    previousValue: ConfigVariables[T] | undefined;
    nextValue: ConfigVariables[T] | undefined;
  }): Promise<void> {
    try {
      await this.configVariableVersionService.recordChange({
        key,
        action,
        previousValue,
        nextValue,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to record config version for ${key as string}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
