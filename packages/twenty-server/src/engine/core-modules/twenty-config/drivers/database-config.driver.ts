import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { DatabaseConfigDriverInterface } from 'src/engine/core-modules/twenty-config/drivers/interfaces/database-config-driver.interface';

import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_REFRESH_CRON_INTERVAL } from 'src/engine/core-modules/twenty-config/constants/config-variables-refresh-cron-interval.constants';
import { ConfigStorageService } from 'src/engine/core-modules/twenty-config/storage/config-storage.service';
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
        `[INIT] Config variables loaded: ${loadedCount} values found, ${this.allPossibleConfigKeys.length - loadedCount} missing`,
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
      this.logger.debug(
        `[UPDATE] Config variable ${key as string} updated successfully`,
      );
    } catch (error) {
      this.logger.error(
        `[UPDATE] Failed to update config variable ${key as string}`,
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
          `[FETCH] Config variable ${key as string} loaded from database`,
        );
      } else {
        this.configCache.markKeyAsMissing(key);
        this.logger.debug(
          `[FETCH] Config variable ${key as string} not found in database, marked as missing`,
        );
      }
    } catch (error) {
      this.logger.error(
        `[FETCH] Failed to fetch config variable ${key as string} from database`,
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
      this.logger.debug('[LOAD] Fetching all config variables from database');
      const configVars = await this.configStorage.loadAll();

      this.logger.debug(
        `[LOAD] Processing ${this.allPossibleConfigKeys.length} possible config variables`,
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
        `[LOAD] Cached ${configVars.size} config variables, marked ${missingKeysCount} keys as missing`,
      );

      return configVars.size;
    } catch (error) {
      this.logger.error(
        '[LOAD] Failed to load config variables from database',
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
      this.logger.debug(
        '[REFRESH] Starting scheduled refresh of config variables',
      );

      const dbValues = await this.configStorage.loadAll();

      this.logger.debug(
        `[REFRESH] Processing ${this.allPossibleConfigKeys.length} possible config variables`,
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
        `[REFRESH] Config variables refreshed: ${dbValues.size} values updated, ${missingKeysCount} marked as missing`,
      );
    } catch (error) {
      this.logger.error('[REFRESH] Failed to refresh config variables', error);
      // Error is caught and logged but not rethrown to prevent the cron job from crashing
    }
  }
}
