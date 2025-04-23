import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { DatabaseConfigDriverInterface } from 'src/engine/core-modules/twenty-config/drivers/interfaces/database-config-driver.interface';

import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_REFRESH_INTERVAL_MINUTES } from 'src/engine/core-modules/twenty-config/constants/config-variables-refresh-interval';
import { ConfigStorageService } from 'src/engine/core-modules/twenty-config/storage/config-storage.service';
import { isEnvOnlyConfigVar } from 'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util';

import { EnvironmentConfigDriver } from './environment-config.driver';

@Injectable()
export class DatabaseConfigDriver implements DatabaseConfigDriverInterface {
  private initializationPromise: Promise<void> | null = null;
  private readonly logger = new Logger(DatabaseConfigDriver.name);

  constructor(
    private readonly configCache: ConfigCacheService,
    private readonly configStorage: ConfigStorageService,
    private readonly environmentDriver: EnvironmentConfigDriver,
  ) {}

  async initialize(): Promise<void> {
    if (this.initializationPromise) {
      this.logger.verbose('Config database initialization already in progress');

      return this.initializationPromise;
    }

    this.logger.debug('Starting database config initialization');

    const promise = this.loadAllConfigVarsFromDb()
      .then((loadedCount) => {
        this.logger.log(
          `Database config ready: loaded ${loadedCount} variables`,
        );
      })
      .catch((error) => {
        this.logger.error(
          'Failed to load database config: unable to connect to database or fetch config',
          error instanceof Error ? error.stack : error,
        );
        throw error;
      })
      .finally(() => {
        this.initializationPromise = null;
      });

    this.initializationPromise = promise;

    return promise;
  }

  get<T extends keyof ConfigVariables>(key: T): ConfigVariables[T] {
    if (isEnvOnlyConfigVar(key)) {
      return this.environmentDriver.get(key);
    }

    const { value, isStale } = this.configCache.get(key);

    if (value !== undefined) {
      if (isStale) {
        this.scheduleRefresh(key);
      }

      return value;
    }

    if (this.configCache.isKeyKnownMissing(key)) {
      return this.environmentDriver.get(key);
    }

    this.scheduleRefresh(key);

    return this.environmentDriver.get(key);
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

    try {
      await this.configStorage.set(key, value);
      this.configCache.set(key, value);
      this.logger.debug(`Updated config variable: ${key as string}`);
    } catch (error) {
      this.logger.error(`Failed to update config for ${key as string}`, error);
      throw error;
    }
  }

  async fetchAndCacheConfigVariable(key: keyof ConfigVariables): Promise<void> {
    try {
      const value = await this.configStorage.get(key);

      if (value !== undefined) {
        this.configCache.set(key, value);
        this.logger.debug(
          `Refreshed config variable in cache: ${key as string}`,
        );
      } else {
        this.configCache.markKeyAsMissing(key);
        this.logger.debug(
          `Marked config variable as missing: ${key as string}`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to fetch config for ${key as string}`, error);
      this.configCache.markKeyAsMissing(key);
    }
  }

  getCacheInfo(): {
    positiveEntries: number;
    negativeEntries: number;
    cacheKeys: string[];
  } {
    return this.configCache.getCacheInfo();
  }

  private async loadAllConfigVarsFromDb(): Promise<number> {
    try {
      this.logger.debug('Fetching all config variables from database');
      const configVars = await this.configStorage.loadAll();

      for (const [key, value] of configVars.entries()) {
        this.configCache.set(key, value);
      }

      return configVars.size;
    } catch (error) {
      this.logger.error('Failed to load config variables from database', error);
      throw error;
    }
  }

  private async scheduleRefresh(key: keyof ConfigVariables): Promise<void> {
    setImmediate(async () => {
      await this.fetchAndCacheConfigVariable(key).catch((error) => {
        this.logger.error(`Failed to fetch config for ${key as string}`, error);
      });
    });
  }

  /**
   * Proactively refreshes expired entries in the config cache.
   * This method runs on a schedule and fetches all expired keys in one database query,
   * then updates the cache with fresh values.
   */
  @Cron(`0 */${CONFIG_VARIABLES_REFRESH_INTERVAL_MINUTES} * * * *`)
  async refreshExpiredCache(): Promise<void> {
    try {
      this.logger.log('Starting proactive refresh of expired config variables');

      const expiredKeys = this.configCache.getExpiredKeys();

      if (expiredKeys.length === 0) {
        this.logger.debug('No expired config variables to refresh');

        return;
      }

      this.logger.debug(
        `Found ${expiredKeys.length} expired config variables to refresh`,
      );

      const refreshableKeys = expiredKeys.filter(
        (key) => !isEnvOnlyConfigVar(key),
      ) as Array<keyof ConfigVariables>;

      if (refreshableKeys.length === 0) {
        this.logger.debug(
          'No refreshable config variables found (all are env-only)',
        );

        return;
      }

      const refreshedValues =
        await this.configStorage.loadByKeys(refreshableKeys);

      if (refreshedValues.size === 0) {
        this.logger.debug('No values found for expired keys');

        for (const key of refreshableKeys) {
          this.configCache.markKeyAsMissing(key);
        }

        return;
      }

      for (const [key, value] of refreshedValues.entries()) {
        this.configCache.set(key, value);
      }

      for (const key of refreshableKeys) {
        if (!refreshedValues.has(key)) {
          this.configCache.markKeyAsMissing(key);
        }
      }

      this.logger.log(
        `Refreshed ${refreshedValues.size} config variables in cache`,
      );
    } catch (error) {
      this.logger.error('Failed to refresh expired config variables', error);
    }
  }
}
