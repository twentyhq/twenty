import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

import pRetry from 'p-retry';

import { DatabaseConfigDriverInterface } from 'src/engine/core-modules/twenty-config/drivers/interfaces/database-config-driver.interface';

import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { DATABASE_CONFIG_DRIVER_RETRY_OPTIONS } from 'src/engine/core-modules/twenty-config/constants/database-config-driver-retry-options';
import { ConfigInitializationState } from 'src/engine/core-modules/twenty-config/enums/config-initialization-state.enum';
import { ConfigStorageService } from 'src/engine/core-modules/twenty-config/storage/config-storage.service';
import { isEnvOnlyConfigVar } from 'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util';

import { EnvironmentConfigDriver } from './environment-config.driver';

@Injectable()
export class DatabaseConfigDriver
  implements DatabaseConfigDriverInterface, OnModuleDestroy
{
  private configInitializationState = ConfigInitializationState.NOT_INITIALIZED;
  private configInitializationPromise: Promise<void> | null = null;
  private abortController: AbortController | null = null;
  private readonly logger = new Logger(DatabaseConfigDriver.name);

  constructor(
    private readonly configCache: ConfigCacheService,
    private readonly configStorage: ConfigStorageService,
    private readonly environmentDriver: EnvironmentConfigDriver,
  ) {}

  async initialize(): Promise<void> {
    if (
      this.configInitializationState === ConfigInitializationState.INITIALIZED
    ) {
      return Promise.resolve();
    }
    if (this.configInitializationPromise) {
      return this.configInitializationPromise;
    }

    if (this.configInitializationState === ConfigInitializationState.FAILED) {
      this.configInitializationState =
        ConfigInitializationState.NOT_INITIALIZED;
    }

    this.configInitializationPromise = this.doInitialize();

    return this.configInitializationPromise;
  }

  private async doInitialize(): Promise<void> {
    this.abortController = new AbortController();

    try {
      this.configInitializationState = ConfigInitializationState.INITIALIZING;

      await pRetry(
        async () => {
          if (this.abortController?.signal.aborted) {
            throw new pRetry.AbortError('Initialization aborted');
          }

          await this.loadAllConfigVarsFromDb();

          return true;
        },
        {
          ...DATABASE_CONFIG_DRIVER_RETRY_OPTIONS,
          onFailedAttempt: (error) => {
            this.logger.error(
              `Failed to initialize database driver (attempt ${error.attemptNumber}/${DATABASE_CONFIG_DRIVER_RETRY_OPTIONS.retries})`,
              error instanceof Error ? error.stack : error,
            );
          },
        },
      );

      this.configInitializationState = ConfigInitializationState.INITIALIZED;
      this.logger.log('Database config driver successfully initialized');
    } catch (error) {
      this.logger.error(
        'Failed to initialize database driver after maximum retries',
        error instanceof Error ? error.stack : error,
      );
      this.configInitializationState = ConfigInitializationState.FAILED;
    } finally {
      this.configInitializationPromise = null;
      this.abortController = null;
    }
  }

  get<T extends keyof ConfigVariables>(key: T): ConfigVariables[T] {
    if (this.shouldUseEnvironment(key)) {
      return this.environmentDriver.get(key);
    }

    const cachedValue = this.configCache.get(key);

    if (cachedValue !== undefined) {
      return cachedValue;
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
    if (this.shouldUseEnvironment(key)) {
      throw new Error(
        `Cannot update environment-only variable: ${key as string}`,
      );
    }

    try {
      await this.configStorage.set(key, value);
      this.configCache.set(key, value);
    } catch (error) {
      this.logger.error(`Failed to update config for ${key as string}`, error);
      throw error;
    }
  }

  async fetchAndCacheConfig(key: keyof ConfigVariables): Promise<void> {
    try {
      const value = await this.configStorage.get(key);

      if (value !== undefined) {
        this.configCache.set(key, value);
      } else {
        this.configCache.markKeyAsMissing(key);
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

  private shouldUseEnvironment(key: keyof ConfigVariables): boolean {
    return (
      this.configInitializationState !==
        ConfigInitializationState.INITIALIZED || isEnvOnlyConfigVar(key)
    );
  }

  private async loadAllConfigVarsFromDb(): Promise<void> {
    try {
      const configVars = await this.configStorage.loadAll();

      for (const [key, value] of configVars.entries()) {
        this.configCache.set(key, value);
      }

      this.logger.log(
        `Loaded ${configVars.size} config variables from database`,
      );
    } catch (error) {
      this.logger.error('Failed to load config variables from database', error);
      throw error;
    }
  }

  private async scheduleRefresh(key: keyof ConfigVariables): Promise<void> {
    if (
      this.configInitializationState !== ConfigInitializationState.INITIALIZED
    ) {
      return;
    }

    setImmediate(async () => {
      await this.fetchAndCacheConfig(key).catch((error) => {
        this.logger.error(`Failed to fetch config for ${key as string}`, error);
      });
    });
  }

  onModuleDestroy() {
    // Abort any in-progress initialization
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}
