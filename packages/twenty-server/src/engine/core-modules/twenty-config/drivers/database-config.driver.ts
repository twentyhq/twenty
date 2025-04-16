import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

import { DatabaseConfigDriverInterface } from 'src/engine/core-modules/twenty-config/drivers/interfaces/database-config-driver.interface';

import { ConfigCacheService } from 'src/engine/core-modules/twenty-config/cache/config-cache.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { DATABASE_CONFIG_DRIVER_INITIAL_RETRY_DELAY } from 'src/engine/core-modules/twenty-config/constants/database-config-driver-initial-retry-delay';
import { DATABASE_CONFIG_DRIVER_INITIALIZATION_MAX_RETRIES } from 'src/engine/core-modules/twenty-config/constants/database-config-driver-initialization-max-retries';
import { InitializationState } from 'src/engine/core-modules/twenty-config/enums/initialization-state.enum';
import { ConfigStorageService } from 'src/engine/core-modules/twenty-config/storage/config-storage.service';
import { isEnvOnlyConfigVar } from 'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util';

import { EnvironmentConfigDriver } from './environment-config.driver';

@Injectable()
export class DatabaseConfigDriver
  implements DatabaseConfigDriverInterface, OnModuleDestroy
{
  private initializationState = InitializationState.NOT_INITIALIZED;
  private initializationPromise: Promise<void> | null = null;
  private retryAttempts = 0;
  private retryTimer?: NodeJS.Timeout;
  private readonly logger = new Logger(DatabaseConfigDriver.name);

  constructor(
    private readonly configCache: ConfigCacheService,
    private readonly configStorage: ConfigStorageService,
    private readonly environmentDriver: EnvironmentConfigDriver,
  ) {}

  async initialize(): Promise<void> {
    if (this.initializationState === InitializationState.INITIALIZED) {
      return Promise.resolve();
    }
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.initializationState === InitializationState.FAILED) {
      this.initializationState = InitializationState.NOT_INITIALIZED;
    }

    this.initializationPromise = this.doInitialize();

    return this.initializationPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      this.initializationState = InitializationState.INITIALIZING;
      await this.loadAllConfigVarsFromDb();
      this.initializationState = InitializationState.INITIALIZED;
    } catch (error) {
      this.logger.error('Failed to initialize database driver', error);
      this.initializationState = InitializationState.FAILED;
      this.scheduleRetry();
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

    if (this.configCache.getNegativeLookup(key)) {
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

  clearAllCache(): void {
    this.configCache.clearAll();
  }

  async refreshConfig(key: keyof ConfigVariables): Promise<void> {
    try {
      const value = await this.configStorage.get(key);

      if (value !== undefined) {
        this.configCache.set(key, value);
      } else {
        this.configCache.setNegativeLookup(key);
      }
    } catch (error) {
      this.logger.error(`Failed to refresh config for ${key as string}`, error);
      this.configCache.setNegativeLookup(key);
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
      this.initializationState !== InitializationState.INITIALIZED ||
      isEnvOnlyConfigVar(key)
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
    if (this.initializationState !== InitializationState.INITIALIZED) {
      return;
    }

    setImmediate(async () => {
      await this.refreshConfig(key).catch((error) => {
        this.logger.error(
          `Failed to refresh config for ${key as string}`,
          error,
        );
      });
    });
  }

  private scheduleRetry(): void {
    this.retryAttempts++;

    if (
      this.retryAttempts > DATABASE_CONFIG_DRIVER_INITIALIZATION_MAX_RETRIES
    ) {
      this.logger.error('Max retry attempts reached, giving up initialization');

      return;
    }

    const delay =
      DATABASE_CONFIG_DRIVER_INITIAL_RETRY_DELAY *
      Math.pow(2, this.retryAttempts - 1);

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    this.retryTimer = setTimeout(() => {
      this.initializationPromise = null;
      this.initialize().catch((error) => {
        this.logger.error('Retry initialization failed', error);
      });
    }, delay);
  }

  onModuleDestroy() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }
}
