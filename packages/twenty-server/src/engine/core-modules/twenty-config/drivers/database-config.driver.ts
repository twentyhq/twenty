import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { DatabaseConfigDriverInterface } from 'src/engine/core-modules/twenty-config/drivers/interfaces/database-config-driver.interface';

import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_REFRESH_CRON_INTERVAL } from 'src/engine/core-modules/twenty-config/constants/config-variables-refresh-cron-interval.constants';
import { ConfigStorageService } from 'src/engine/core-modules/twenty-config/storage/config-storage.service';
import { isEnvOnlyConfigVar } from 'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util';

import { EnvironmentConfigDriver } from './environment-config.driver';

@Injectable()
export class DatabaseConfigDriver implements DatabaseConfigDriverInterface {
  private initializationPromise: Promise<void> | null = null;
  private readonly logger = new Logger(DatabaseConfigDriver.name);
  private readonly allPossibleConfigKeys: Array<keyof ConfigVariables>;

  constructor(
    private readonly configCache: ConfigCacheService,
    private readonly configStorage: ConfigStorageService,
    private readonly environmentDriver: EnvironmentConfigDriver,
  ) {
    const allKeys = Object.keys(new ConfigVariables()) as Array<
      keyof ConfigVariables
    >;

    this.allPossibleConfigKeys = allKeys.filter(
      (key) => !isEnvOnlyConfigVar(key),
    );
  }

  async initialize(): Promise<void> {
    if (this.initializationPromise) {
      this.logger.verbose(
        '[INIT] Config database initialization already in progress',
      );

      return this.initializationPromise;
    }

    this.logger.debug('[INIT] Starting database config initialization');

    const promise = this.loadAllConfigVarsFromDb()
      .then((loadedCount) => {
        this.logger.log(
          `[INIT] Database config ready: loaded ${loadedCount} variables`,
        );
      })
      .catch((error) => {
        this.logger.error(
          '[INIT] Failed to load database config: unable to connect to database or fetch config',
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

    const value = this.configCache.get(key);

    if (value !== undefined) {
      return value;
    }

    if (this.configCache.isKeyKnownMissing(key)) {
      return this.environmentDriver.get(key);
    }

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
      this.logger.debug(`[UPDATE] Updated config variable: ${key as string}`);
    } catch (error) {
      this.logger.error(
        `[UPDATE] Failed to update config for ${key as string}`,
        error,
      );
      throw error;
    }
  }

  async fetchAndCacheConfigVariable(key: keyof ConfigVariables): Promise<void> {
    try {
      const value = await this.configStorage.get(key);

      if (value !== undefined) {
        this.configCache.set(key, value);
        this.logger.debug(
          `[FETCH] Refreshed config variable in cache: ${key as string}`,
        );
      } else {
        this.configCache.markKeyAsMissing(key);
        this.logger.debug(
          `[FETCH] Marked config variable as missing: ${key as string}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `[FETCH] Failed to fetch config for ${key as string}`,
        error,
      );
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
      this.logger.debug('[INIT] Fetching all config variables from database');
      const configVars = await this.configStorage.loadAll();

      this.logger.debug(
        `[INIT] Checking ${this.allPossibleConfigKeys.length} possible config variables`,
      );

      for (const [key, value] of configVars.entries()) {
        this.configCache.set(key, value);
      }

      for (const key of this.allPossibleConfigKeys) {
        if (!configVars.has(key)) {
          this.configCache.markKeyAsMissing(key);
        }
      }

      const missingKeysCount =
        this.allPossibleConfigKeys.length - configVars.size;

      this.logger.debug(
        `[INIT] Initial cache state: ${configVars.size} found values, ${missingKeysCount} missing values`,
      );

      return configVars.size;
    } catch (error) {
      this.logger.error(
        '[INIT] Failed to load config variables from database',
        error,
      );
      throw error;
    }
  }

  /**
   * Refreshes all database-backed config variables.
   * This method runs on a schedule and fetches all configs in one database query,
   * then updates the cache with fresh values.
   */
  @Cron(CONFIG_VARIABLES_REFRESH_CRON_INTERVAL)
  async refreshAllCache(): Promise<void> {
    try {
      this.logger.log('[REFRESH] Starting refresh of all config variables');

      const dbValues = await this.configStorage.loadAll();

      this.logger.debug(
        `[REFRESH] Checking ${this.allPossibleConfigKeys.length} possible config variables`,
      );

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

      const missingKeysCount =
        this.allPossibleConfigKeys.length - dbValues.size;

      this.logger.log(
        `[REFRESH] Refreshed config cache: ${dbValues.size} found values, ${missingKeysCount} missing values`,
      );
    } catch (error) {
      this.logger.error('[REFRESH] Failed to refresh config variables', error);
    }
  }
}
